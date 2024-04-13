import { number, z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import * as schema from "~/server/db/schema";
import { type DBTX, db } from "~/server/db";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import * as xlsx from "xlsx";
import {
  columnLabelByKey,
  recHeaders,
  recRowsTransformer,
} from "~/server/uploads/validators";
import { createId } from "~/lib/utils";

export const uploadsRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const upload = await db.query.documentUploads.findFirst({
        where: eq(schema.documentUploads.id, input.id),
      });

      return upload;
    }),
  responseUpload: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const responseUpload = await db.query.responseDocumentUploads.findFirst({
        where: eq(schema.responseDocumentUploads.id, input.id),
      });
      return responseUpload;
    }),

  list: protectedProcedure.query(async ({}) => {
    return await db.query.documentUploads.findMany();
  }),
  readUploadContents: protectedProcedure
    .input(
      z.object({
        type: z.literal("rec"),
        id: z.string(),
        companyId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db.transaction(async (db) => {
        console.log("se llama a la funcion");
        const channels = await getCompanyProducts(db, input.companyId);
        console.log("no fallo getbrands");
        const brands = await getCompanyBrands(db, input.companyId);
        console.log("no fallo getproducts");
        const contents = await readUploadContents(
          db,
          input.id,
          input.type,
          channels,
          brands,
        );
        console.log("no fallo readcontents");
        await db
          .update(schema.documentUploads)
          .set({
            documentType: input.type,
            rowsCount: contents?.rows.length,
          })
          .where(eq(schema.documentUploads.id, input.id));

        return contents;
      });
    }),
  readResponseUploadContents: protectedProcedure
    .input(
      z.object({
        type: z.literal("txt"),
        uploadId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db.transaction(async (db) => {
        const contents = await readResponseUploadContents(
          db,
          input.uploadId,
          input.type,
        );
        await db.update(schema.responseDocumentUploads).set({
          documentType: input.type,
          rowsCount: contents.total_rows,
        });
        return contents;
      });
    }),
  get: protectedProcedure
    .input(
      z.object({
        uploadId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const upload = await db.query.documentUploads.findFirst({
        where: eq(schema.documentUploads.id, input.uploadId),
      });

      return upload;
    }),
  confirmResponseUpload: protectedProcedure
    .input(
      z.object({
        uploadId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const { records } = await readResponseUploadContents(
          tx,
          input.uploadId,
          undefined,
        );

        await tx
          .update(schema.responseDocumentUploads)
          .set({
            confirmed: true,
            confirmedAt: new Date(),
          })
          .where(eq(schema.responseDocumentUploads.id, input.uploadId));

        await Promise.all(
          records.map(async (record) => {
            const invoiceNumber = record.invoice_number || 0;
            console.log(invoiceNumber, typeof invoiceNumber);
            console.log(record.status_code, typeof record.status_code);
            console.log(eq(schema.payments.invoice_number, invoiceNumber));
            await tx
              .update(schema.payments)
              .set({ status_code: record.status_code })
              .where(eq(schema.payments.invoice_number, invoiceNumber));
          }),
        );
      });
    }),

  confirmUpload: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        companyId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await db.transaction(async (tx) => {
        const channels = await getCompanyProducts(tx, input.companyId);
        const brands = await getCompanyBrands(tx, input.companyId);
        const result = await readUploadContents(
          tx,
          input.id,
          undefined,
          channels,
          brands,
        );
        if (result) {
          const { rows, upload } = result;
          if (upload.confirmed) {
            tx.rollback();
          }

          await tx
            .update(schema.documentUploads)
            .set({
              confirmed: true,
              confirmedAt: new Date(),
            })
            .where(eq(schema.documentUploads.id, input.id));

          // arreglar esto, row tiene campos que no van a payments parece o se llaman distinto
          await tx.insert(schema.payments).values(
            rows.map((row) => ({
              id: createId(),
              userId: ctx.session.user.id,
              documentUploadId: upload.id,
              companyId: input.companyId,
              g_c: row.g_c,
              name: row.name,
              fiscal_id_type: row.fiscal_id_type,
              fiscal_id_number: row.fiscal_id_number,
              du_type: row.du_type,
              du_number: row.du_number,
              product: row.product,
              product_number: row.product_number,
              invoice_number: row.invoice_number!,
              period: row.period,
              first_due_amount: row.first_due_amount,
              first_due_date: row.first_due_date,
              second_due_amount: row.second_due_amount ?? null,
              second_due_date: row.second_due_date ?? null,
              additional_info: row.additional_info ?? null,
              payment_channel: row.payment_channel ?? null,
              payment_date: row.payment_date ?? null,
              collected_amount: row.collected_amount ?? null,
              cbu: row.cbu ?? null,
              status_code: "91",
            })),
          );
        }
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        uploadId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.documentUploads)
        .where(eq(schema.documentUploads.id, input.uploadId));
    }),
});

async function getCompanyProducts(db: DBTX, companyId: string) {
  console.log("empieza funcion getProducts");
  const r = await db.query.companies.findFirst({
    where: eq(schema.companies.id, companyId),
    with: {
      products: {
        with: {
          product: {
            with: {
              channels: {
                with: {
                  channel: {
                    columns: {
                      id: true,
                      requiredColumns: true,
                    },
                  },
                },
              },
            },
            columns: {
              id: true,
              number: true,
              enabled: true,
            },
          },
        },
      },
    },
  });
  console.log(r);

  const p = r?.products.map((p) => p.product) ?? [];

  console.log(p);
  console.log(p[0]?.channels);
  const values = p.map((product) => ({
    id: product.id,
    number: product.number,
    requiredColumns: new Set(
      product.channels
        .map((c) => c.channel.requiredColumns)
        .reduce((acc, val) => acc.concat(val), []),
    ),
  }));
  console.log(values);
  return values;
}

async function getCompanyBrands(db: DBTX, companyId: string) {
  const relations = await db.query.companiesToBrands.findMany({
    where: eq(schema.companiesToBrands.companyId, companyId),
  });

  const brands = [];
  for (const relation of relations) {
    const brandId = relation.brandId;
    const brand = await db.query.brands.findMany({
      where: eq(schema.brands.id, brandId),
    });
    brands.push(brand);
  }
  return brands;
}

async function readResponseUploadContents(
  db: DBTX,
  id: string,
  type: string | undefined,
) {
  const upload = await db.query.responseDocumentUploads.findFirst({
    where: eq(schema.responseDocumentUploads.id, id),
  });

  if (!upload) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  if (!type) {
    type = upload.documentType ?? undefined;
  }

  if (!type) {
    throw new TRPCError({ code: "BAD_REQUEST" });
  }
  const response = await fetch(upload.fileUrl);
  const fileContent = await response.text();
  const lines: string[] = fileContent.trim().split(/\r?\n/);
  // encabezado
  lines.shift();
  lines.pop();
  let total_rows = 2;
  let recordIndex = 1;
  const records = [];
  for (const line of lines) {
    if (recordIndex == 1) {
      const recordValues = line.trim().split(/\s{2,}/);
      //trato el ultimo elemento que esta junto nro de factura y estado de pago
      const largeNumber = recordValues[2];
      const status_code = largeNumber?.slice(-2);
      console.log(status_code);
      // extract invoice_number
      const stringInvoiceNumber = recordValues[recordValues.length - 1] ?? null;
      console.log(recordValues);
      console.log(stringInvoiceNumber);

      if (!stringInvoiceNumber) {
        throw new Error("there is no invoice number");
      }

      const invoice_number = stringInvoiceNumber.slice(9, 14) ?? null;
      console.log(invoice_number);
      if (invoice_number) {
        const original_transaction = await db.query.payments.findFirst({
          where: eq(schema.payments.invoice_number, parseInt(invoice_number)),
        });
        if (original_transaction) {
          original_transaction.status_code = status_code ?? null;
          records.push(original_transaction);
        }
      } else {
        throw Error("cannot read invoice number");
      }
    } else if (recordIndex == 4) {
      recordIndex = 0;
    }
    total_rows++;
    recordIndex++;
  }

  return { upload, records, total_rows, header: recHeaders };
}

type ProductsOfCompany = Awaited<ReturnType<typeof getCompanyProducts>>;
type BrandsOfCompany = Awaited<ReturnType<typeof getCompanyBrands>>;

async function readUploadContents(
  db: DBTX,
  id: string,
  type: string | undefined,
  products: ProductsOfCompany,
  brands: BrandsOfCompany,
) {
  console.log("hola que hace");
  const upload = await db.query.documentUploads.findFirst({
    where: eq(schema.documentUploads.id, id),
  });

  if (!upload) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  if (!type) {
    type = upload.documentType ?? undefined;
  }

  if (!type) {
    throw new TRPCError({ code: "BAD_REQUEST" });
  }

  const response = await fetch(upload.fileUrl);
  const content = await response.arrayBuffer();

  const workbook = xlsx.read(content, { type: "buffer" });

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]!]!;

  const rows = xlsx.utils.sheet_to_json(firstSheet) as unknown as Record<
    string,
    unknown
  >[];

  const trimmedRows = rows.map(trimObject);

  trimmedRows.forEach((row) => {
    if ("Período" in row) {
      row.Período = row.Período?.toString();
    }
  });
  const transformedRows = recRowsTransformer(trimmedRows);

  const productsMap = Object.fromEntries(
    products.map((product) => [product.number, product]),
  );

  const errors: string[] = [];

  const productsBatch = Object.fromEntries(
    Object.keys(productsMap).map((clave) => [
      clave,
      { amount_collected: 0, records_number: 0 },
    ]),
  );
  console.log("info de cabeza de lote", productsBatch);

  for (let i = 0; i < transformedRows.length; i++) {
    const row = transformedRows[i]!;

    const rowNum = i + 2;

    let product;
    if (products.length === 1) {
      product = products[0];
      row.product_number = product?.number ?? 0;
      row.product = product?.id ?? null;
    } else {
      product = productsMap[row.product_number];
      row.product = product?.id ?? null;
    }

    if (brands.length === 1) {
      if (!brands[0]) {
        throw new Error("brands does not exist");
      }

      const brand = brands[0][0] ?? null;

      if (!brand) {
        throw new Error("brand is undefined");
      }
      row.g_c = brand?.number;
    }

    if (!product) {
      // throw new TRPCError({ code: "BAD_REQUEST", message:  })
      errors.push(
        `La fila ${rowNum} tiene un producto inválido "${row.product} (factura: ${row.invoice_number})"`,
      );
      continue;
    }

    if (!row.invoice_number) {
      let invoice_number = Math.floor(10000 + Math.random() * 90000);
      const transactionFound = await db.query.payments.findFirst({
        where: eq(schema.payments.invoice_number, invoice_number),
      });
      while (transactionFound) {
        invoice_number = Math.floor(10000 + Math.random() * 90000);
      }
      row.invoice_number = invoice_number;
    }
    const exemptedColumns = []
    
    if(brands.length===1){
      exemptedColumns.push("g_c")
    }
    

    for (const column of product.requiredColumns) {
      console.log(column);
      const value = (row as Record<string, unknown>)[column];
      
      if (!value && !exemptedColumns.includes(column)) {
        const columnName = columnLabelByKey[column] ?? column;

        // throw new TRPCError({ code: "BAD_REQUEST", message:  })
        errors.push(
          `En la fila ${rowNum} la columna "${columnName}" está vacia (factura: ${row.invoice_number})`,
        );
      }
    }
    //agrego fila a info de cabeza de lote

    if (productsBatch[product.number]) {
      const temp = productsBatch[product.number];
      if (temp) {
        temp.records_number += 1;
        if (row.collected_amount !== null) {
          temp.amount_collected += row.collected_amount;
        }
        productsBatch[product.number] = temp;
      }
    }

    if (errors.length > 0) {
      throw new TRPCError({ code: "BAD_REQUEST", message: errors.join("\n") });
    }

    //throw new TRPCError({ code: "NOT_FOUND" });
  }

  if (type === "rec") {
    return {
      rows: transformedRows,
      headers: recHeaders,
      batchHead: productsBatch,
      upload,
    };
  }
  // for (const key in productsBatch) {
  //   if (productsBatch.hasOwnProperty(key)) {
  //     const productHead = { ...productsBatch[key], key };
  //     batchHead.push(productHead);
  //   }
  // }

  function trimObject(obj: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => {
        if (typeof value === "string") {
          const t = value.trim();

          if (t === "") return [key, null];

          return [key, t];
        }

        return [key, value];
      }),
    );
  }
}
