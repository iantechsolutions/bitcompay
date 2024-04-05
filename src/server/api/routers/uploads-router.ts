import { z } from "zod";
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
        const channels = await getCompanyProducts(db, input.companyId);
        const contents = await readUploadContents(
          db,
          input.id,
          input.type,
          channels,
        );

        await db
          .update(schema.documentUploads)
          .set({
            documentType: input.type,
            rowsCount: contents.rows.length,
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

        const { rows, upload } = await readUploadContents(
          tx,
          input.id,
          undefined,
          channels,
        );

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

        await tx.insert(schema.payments).values(
          rows.map((row) => ({
            id: createId(),
            userId: ctx.session.user.id,
            documentUploadId: upload.id,
            companyId: input.companyId,
            status_code: "91",
            ...row,
          })),
        );
      });
    }),
});

async function getCompanyProducts(db: DBTX, companyId: string) {
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

  const p = r?.products.map((p) => p.product) ?? [];
  console.log(p);
  return p.map((product) => ({
    id: product.id,
    number: product.number,
    requiredColumns: new Set(
      product.channels
        .map((c) => c.channel.requiredColumns)
        .reduce((acc, val) => acc.concat(val), []),
    ),
  }));
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
      const regex = /\d{15}[PC][A-Za-z]*/;
      const stringInvoiceNumber = recordValues.filter((recordValue) =>
        regex.test(recordValue),
      );
      console.log(recordValues);
      console.log(stringInvoiceNumber);
      const matches = stringInvoiceNumber[0]?.trim().match(/[a-zA-Z]+|[0-9]+/g);
      console.log(matches);
      if (matches) {
        const invoice_number = matches[0].slice(-5);
        const original_transaction = await db.query.payments.findFirst({
          where: eq(schema.payments.invoice_number, parseInt(invoice_number)),
        });
        if (original_transaction) {
          original_transaction.status_code = status_code ?? null;
          records.push(original_transaction);
        }
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

async function readUploadContents(
  db: DBTX,
  id: string,
  type: string | undefined,
  products: ProductsOfCompany,
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

  const transformedRows = recRowsTransformer(rows.map(trimObject));

  const productsMap = Object.fromEntries(
    products.map((product) => [product.number, product]),
  );

  const errors: string[] = [];

  console.log(products);
  for (let i = 0; i < transformedRows.length; i++) {
    const row = transformedRows[i]!;

    const rowNum = i + 2;

    let product;
    if (products.length === 1) {
      product = products[0];
      row.product_number = product?.number ?? 0;
    } else {
      product = productsMap[row.product_number];
    }

    if (!product) {
      // throw new TRPCError({ code: "BAD_REQUEST", message:  })
      errors.push(
        `La fila ${rowNum} tiene un producto inválido "${row.product} (factura: ${row.invoice_number})"`,
      );
      continue;
    }

    for (const column of product.requiredColumns) {
      const value = (row as Record<string, unknown>)[column];

      if (!value) {
        const columnName = columnLabelByKey[column] ?? column;

        // throw new TRPCError({ code: "BAD_REQUEST", message:  })
        errors.push(
          `En la fila ${rowNum} la columna "${columnName}" está vacia (factura: ${row.invoice_number})`,
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: errors.join("\n") });
  }

  if (type === "rec") {
    return {
      rows: transformedRows,
      headers: recHeaders,
      upload,
    };
  }

  throw new TRPCError({ code: "NOT_FOUND" });
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
