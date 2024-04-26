import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import * as schema from "~/server/db/schema";
import { type DBTX, db } from "~/server/db";
import { Table, eq } from "drizzle-orm";
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
        const channels = await getCompanyProducts(input.companyId);
        const brands = await getCompanyBrands(input.companyId);

        const contents = await readUploadContents(
          db,
          input.id,
          input.type,
          channels,
          brands,
        );

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
        const channels = await getCompanyProducts(input.companyId);
        const brands = await getCompanyBrands(input.companyId);
        const result = await readUploadContents(
          tx,
          input.id,
          undefined,
          channels,
          brands,
        );
        if (result.rows) {
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

async function getCompanyProducts(companyId: string) {
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
              name: true,
              number: true,
              enabled: true,
            },
          },
        },
      },
    },
  });

  const p = r?.products.map((p) => p.product) ?? [];

  const values = p.map((product) => ({
    id: product.id,
    number: product.number,
    name: product.name,
    requiredColumns: new Set(
      product.channels
        .map((c) => c.channel.requiredColumns)
        .reduce((acc, val) => acc.concat(val), []),
    ),
  }));
  return values;
}

async function getCompanyBrands(companyId: string) {
  const relations = await db.query.companiesToBrands.findMany({
    where: eq(schema.companiesToBrands.companyId, companyId),
  });

  const brands = [];
  for (const relation of relations) {
    const brandId = relation.brandId;
    const brand = await db.query.brands.findMany({
      where: eq(schema.brands.id, brandId),
    });
    brands.push(brand[0]);
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
      // extract invoice_number
      const stringInvoiceNumber = recordValues[recordValues.length - 1] ?? null;

      if (!stringInvoiceNumber) {
        throw new Error("there is no invoice number");
      }

      const invoice_number = stringInvoiceNumber.slice(9, 14) ?? null;
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
    if ("Producto" in row) {
      row.Producto = row.Producto?.toString();
    }
  });

  // const transformedRows = recRowsTransformer(trimmedRows);
  const temp = recRowsTransformer(trimmedRows);
  const transformedRows = temp.transformedRows;
  const cellsToEdit = temp.cellsToEdit;
  const productsMap = Object.fromEntries(
    products.map((product) => [product.number, product]),
  );

  const errors: string[] = [];

  const productsBatch = Object.fromEntries(
    Object.keys(productsMap).map((clave) => [
      clave,
      {
        amount_collected: 0,
        records_number: 0,
        productName: productsMap[clave]?.name,
      },
    ]),
  );
  // verificar si empresa tiene productos y marcas
  if (products.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "esta empresa no tiene ningun producto habilitado",
    });
  }
  if (brands.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "esta empresa no tiene ninguna marca asociada",
    });
  }
  /// verificacion si hay columna producto o marca en excel

  let productColumnExist = false;
  let brandColumnExist = false;
  for (const row of transformedRows) {
    if (row.g_c) {
      brandColumnExist = true;
    }
    if (row.product_number) {
      productColumnExist = true;
    }
  }

  if (!productColumnExist && products.length > 1) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Error: La columna producto no existe en el documento",
    });
  } else if (!brandColumnExist && brands.length > 1) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Error: la columna Marca no existe en el documento",
    });
  }

  for (let i = 0; i < transformedRows.length; i++) {
    const row = transformedRows[i]!;
    const rowNum = i + 2;
    // asignar numero de factura si no tiene
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
    // verificar producto
    let product;
    if (row.product_number) {
      if (row.product_number in productsMap) {
        product = productsMap[row.product_number];
      } else {
        errors.push(
          `Este producto: ${row.product_number} es invalido o  no se encuentra habilitado (fila:${rowNum})`,
        );
      }
    } else {
      if (products.length === 1) {
        product = products[0];
        row.product_number = product?.number ?? 0;
      } else if (products.length > 1) {
        cellsToEdit.push({
          row,
          column: "Producto",
          reason: "Producto inválido",
        });
        errors.push(`Producto invalido en fila: ${rowNum}`);
      }
    }
    // verificar marca
    if (row.g_c) {
      let isInBrands = false;
      for (const brand of brands) {
        if (row.g_c === brand?.number) {
          isInBrands = true;
          break;
        }
      }
      if (!isInBrands) {
        errors.push(
          `Esta Marca: ${row.g_c} es invalido o  no se encuentra habilitado (fila:${rowNum})`,
        );
      }
    } else {
      if (brands.length === 1) {
        row.g_c = brands[0]?.number ?? null;
      } else {
        errors.push(`No existe columna marca en (fila:${rowNum})`);
      }
    }
    // verificar columnas requeridas
    if (product) {
      if (brands.length === 1) {
        product.requiredColumns.delete("g_c");
      }

      for (const column of product.requiredColumns) {
        const value = (row as Record<string, unknown>)[column];
        if (!value) {
          const columnName = columnLabelByKey[column] ?? column;
          // cellsToEdit.push({
          //   row: row,
          //   column: columnName,
          //   reason: "Empty cell",
          // });
          errors.push(
            `Este producto: ${row.product_number} es invalido o  no se encuentra habilitado (fila:${rowNum})`,
          );
        }
      }
    }
    // recolectar info. cabeza de lote
    if (product) {
      if (productsBatch[product.number]) {
        const temp = productsBatch[product.number];
        if (temp) {
          temp.records_number += 1;
          if (row.collected_amount !== null) {
            temp.amount_collected += row.collected_amount;
          } else if (!row.collected_amount && row.first_due_amount !== null) {
            temp.amount_collected += row.first_due_amount;
          }
          productsBatch[product.number] = temp;
        }
      }
    }
  }

  //descartar encabezados no requeridos
  const companyReqColumns = new Set();
  // Iterar sobre cada objeto en el array products
  products.forEach((product) => {
    // Iterar sobre cada elemento del set requiredColumns del objeto actual
    product.requiredColumns.forEach((column) => {
      // Añadir cada columna al conjunto companyReqColumns
      companyReqColumns.add(column);
    });
  });

  const TableHeaders = recHeaders.filter(
    (header) =>
      companyReqColumns.has(header.key) ||
      header.key === "g_c" ||
      header.key === "product_number",
  );

  if (errors.length > 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: errors.join("\n") });
  }
  if (type === "rec") {
    return {
      rows: transformedRows,
      headers: TableHeaders,
      batchHead: productsBatch,
      upload,
      rowToEdit: cellsToEdit,
    };
  } else {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: "suba un archivo en formato xlsx",
    });
  }
}

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
