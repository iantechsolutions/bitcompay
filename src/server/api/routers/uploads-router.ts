import { TRPCError } from "@trpc/server";
import { and, eq, or, desc } from "drizzle-orm";
import * as xlsx from "xlsx";
import { record, z } from "zod";
import { createId } from "~/lib/utils";
import { type DBTX, db } from "~/server/db";
import * as schema from "~/server/db/schema";
import {
  columnLabelByKey,
  recHeaders,
  recRowsTransformer,
} from "~/server/uploads/validators";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const statusCodeMap = new Map();
const statusCodes = await db.query.paymentStatus.findMany();
statusCodes.forEach((status) => {
  statusCodeMap.set(status.code, status.id);
});

export const uploadsRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
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
      })
    )
    .query(async ({ input }) => {
      const responseUpload = await db.query.responseDocumentUploads.findFirst({
        where: eq(schema.responseDocumentUploads.id, input.id),
      });
      return responseUpload;
    }),
  outputUpload: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const outputUpload = await db.query.uploadedOutputFiles.findFirst({
        where: eq(schema.uploadedOutputFiles.id, input.id),
      });
      return outputUpload;
    }),
  list: protectedProcedure.query(async () => {
    return await db.query.documentUploads.findMany();
  }),

  listResponse: protectedProcedure.query(async () => {
    return await db.query.responseDocumentUploads.findMany();
  }),
  listOutput: protectedProcedure.query(async () => {
    return await db.query.uploadedOutputFiles.findMany();
  }),
  readUploadContents: protectedProcedure
    .input(
      z.object({
        type: z.literal("rec"),
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const companyId = ctx.session.orgId;
      return await db.transaction(async (db) => {
        const channels = await getCompanyProducts(companyId!);
        const brands = await getCompanyBrands(companyId!);

        const contents = await readUploadContents(
          db,
          input.id,
          input.type,
          companyId!,
          channels,
          brands
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
      })
    )
    .mutation(async ({ input }) => {
      return await db.transaction(async (db) => {
        const contents = await readResponseUploadContents(
          db,
          input.uploadId,
          input.type
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
      })
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
        // brandId: z.number(),
        channelName: z.string(),
        // companyId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const { records } = await readResponseUploadContents(
          tx,
          input.uploadId,
          undefined
        );

        await tx
          .update(schema.responseDocumentUploads)
          .set({
            confirmed: true,
            confirmedAt: new Date(),
          })
          .where(eq(schema.responseDocumentUploads.id, input.uploadId));
        // TODO:
        await Promise.all(
          records.map(async (record) => {
            const invoiceNumber = record.invoice_number || 0;
            const fiscal_id_number = record.fiscal_id_number || 0;
            let subquery = tx
              .select({ id: schema.payments.id })
              .from(schema.payments)
              .where(eq(schema.payments.fiscal_id_number, fiscal_id_number))
              .orderBy(desc(schema.payments.createdAt))
              .limit(1);
            console.log("subquery", subquery, typeof subquery);
            await tx
              .update(schema.payments)
              .set({
                statusId: record.statusId,
                payment_channel: input.channelName,
              })
              .where(
                or(
                  eq(schema.payments.invoice_number, invoiceNumber),
                  eq(schema.payments.fiscal_id_number, fiscal_id_number)
                )
              );
            const payment = await tx.query.payments.findFirst({
              where: eq(schema.payments.invoice_number, invoiceNumber),
              with: {
                factura: {
                  with: {
                    family_group: {
                      with: {
                        cc: {
                          with: {
                            events: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            });

            if (payment?.factura?.family_group?.cc) {
              const currentAccount = payment?.factura?.family_group?.cc;
              const lastEvent =
                currentAccount?.events[currentAccount?.events.length - 1];
              if (!lastEvent) {
                throw new Error("No hay eventos en la cuenta corriente");
              }
              const event = await tx.insert(schema.events).values({
                currentAccount_id: currentAccount?.id,
                event_amount:
                  record.first_due_amount ?? record.collected_amount ?? 0,
                current_amount:
                  lastEvent?.current_amount! + payment?.factura?.importe!,
                description: "Factura aprobada",
                type: "FC",
              });
            }

            // const payment = await tx.query.payments.findFirst({
            //   where: and(
            //     eq(schema.payments.payment_channel, input.channelId),
            //     eq(schema.payments.g_c, input.brandId),
            //     eq(schema.payments.companyId, input.companyId),
            //     eq(schema.payments.invoice_number, invoiceNumber)
            //   ),
            //   with: {
            //     factura: {
            //       with: {
            //         family_group: {
            //           with: {
            //             cc: true,
            //           },
            //         },
            //       },
            //     },
            //   },
            // });
            // const recordAmount =
            //   record.collected_amount ?? record.first_due_amount;
            // if (payment?.factura && payment.factura.family_group) {
            //   if (payment?.factura.importe == recordAmount) {
            //     tx.update(schema.family_groups)
            //       .set({
            //         payment_status: "paid",
            //       })
            //       .where(
            //         eq(schema.family_groups.id, payment.factura.family_group.id)
            //       );
            //   } else {
            //     tx.update(schema.family_groups)
            //       .set({
            //         payment_status: "partial",
            //       })
            //       .where(
            //         eq(schema.family_groups.id, payment.factura.family_group.id)
            //       );
            //   }
            //   const cc = await tx.query.currentAccount.findFirst({
            //     where: eq(
            //       schema.currentAccount.family_group,
            //       payment.factura.family_group.cc[0]?.id ?? ""
            //     ),
            //     with: {
            //       events: true,
            //     },
            //   });

            //   if (cc?.events && cc?.events?.length > 0) {
            //     const lastEvent = cc?.events[cc.events.length - 1];
            //     tx.insert(schema.events).values({
            //       description: "Pago de factura",
            //       type: "REC",
            //       currentAccount_id: cc.id,
            //       event_amount: payment.factura.importe,
            //       current_amount:
            //         (lastEvent?.current_amount ?? 0) + payment.factura.importe,
            //     });
            //   }
            // }
          })
        );
      });
    }),

  confirmUpload: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const companyId = ctx.session.orgId;
      await db.transaction(async (tx) => {
        const channels = await getCompanyProducts(companyId!);
        const brands = await getCompanyBrands(companyId!);
        const result = await readUploadContents(
          tx,
          input.id,
          "rec",
          companyId!,
          channels,
          brands
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

          const defaultStatus = await tx.query.paymentStatus.findFirst({
            where: eq(schema.paymentStatus.code, "91"),
          });
          await tx.insert(schema.payments).values(
            rows.map((row) => ({
              id: createId(),
              userId: ctx.session.user.id,
              documentUploadId: upload.id,
              companyId: companyId!,
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
              statusId: defaultStatus?.id!,
              card_number: row.card_number?.toString() ?? null,
              card_type: row.card_type ?? null,
              card_brand: row.card_brand ?? null,
            }))
          );
        }
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        uploadId: z.string(),
      })
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
        .reduce((acc, val) => acc.concat(val), [])
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

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
async function readResponseUploadContents(
  db: DBTX,
  id: string,
  inputType: string | undefined
) {
  const upload = await db.query.responseDocumentUploads.findFirst({
    where: eq(schema.responseDocumentUploads.id, id),
  });

  if (!upload) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  const type = inputType ?? upload.documentType ?? undefined;

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
    if (recordIndex === 1) {
      const recordValues = line.trim().split(/\s{2,}/);
      console.log("recordValues", recordValues);
      //trato el ultimo elemento que esta junto nro de factura y estado de pago
      const largeNumber = recordValues[2];
      const status_code = largeNumber?.slice(-2);
      // extract invoice_number
      const stringInvoiceNumber = recordValues[recordValues.length - 1] ?? null;
      console.log("stringInvoiceNumber", stringInvoiceNumber);
      if (!stringInvoiceNumber) {
        throw new Error("there is no invoice number");
      }

      const invoice_number = stringInvoiceNumber.slice(10, 15) ?? null;
      console.log("invoice_number", invoice_number);
      if (invoice_number) {
        const original_transaction = await db.query.payments.findFirst({
          where: eq(
            schema.payments.invoice_number,
            Number.parseInt(invoice_number)
          ),
        });
        if (original_transaction) {
          original_transaction.statusId =
            statusCodeMap.get(status_code) ?? "91";
          console.log("statusCode", status_code);
          console.log("status", original_transaction.statusId);
          records.push(original_transaction);
        }
      } else {
        throw Error("cannot read invoice number");
      }
    } else if (recordIndex === 4) {
      recordIndex = 0;
    }
    total_rows++;
    recordIndex++;
  }
  return { upload, records, total_rows, header: recHeaders };
}

type ProductsOfCompany = Awaited<ReturnType<typeof getCompanyProducts>>;
type BrandsOfCompany = Awaited<ReturnType<typeof getCompanyBrands>>;

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
async function readUploadContents(
  db: DBTX,
  id: string,
  inputType: string | undefined,
  companyId: string,
  products: ProductsOfCompany,
  brands: BrandsOfCompany
) {
  const upload = await db.query.documentUploads.findFirst({
    where: eq(schema.documentUploads.id, id),
  });

  if (!upload) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  const type = inputType ?? upload.documentType ?? undefined;

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

  // biome-ignore lint/complexity/noForEach: <explanation>
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
  console.log("transformedRows", transformedRows);
  const cellsToEdit = temp.cellsToEdit;
  const productsMap = Object.fromEntries(
    products.map((product) => [product.number, product])
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
    ])
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
  }
  if (!brandColumnExist && brands.length > 1) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Error: la columna Marca no existe en el documento",
    });
  }
  const transactionsDB = await db.query.payments.findMany({
    where: eq(schema.payments.companyId, companyId),
  });
  const invoice_number_array = transactionsDB
    .filter((row) => row.invoice_number !== null)
    .map((row) => {
      return row.invoice_number;
    });
  let auxiliarInvoiceNumber =
    invoice_number_array.length > 0 ? Math.max(...invoice_number_array) : 0;
  for (let i = 0; i < transformedRows.length; i++) {
    const row = transformedRows[i]!;
    const rowNum = i + 2;
    // verificar producto
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>

    let product: any = undefined;
    if (row.product_number) {
      if (row.product_number in productsMap) {
        product = productsMap[row.product_number];
      } else {
        errors.push(
          `Este producto: ${row.product_number} es invalido o  no se encuentra habilitado (fila:${rowNum})`
        );
      }
    } else if (products.length === 1) {
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
          `Esta Marca: ${row.g_c} es invalido o  no se encuentra habilitado (fila:${rowNum})`
        );
      }
    } else if (brands.length === 1) {
      row.g_c = brands[0]?.number ?? null;
    } else {
      errors.push(`No existe columna marca en (fila:${rowNum})`);
    }
    // asignar numero de factura si no tiene
    if (!row.invoice_number) {
      auxiliarInvoiceNumber++;
      row.invoice_number = auxiliarInvoiceNumber;
    }
    // verificar columnas requeridas
    if (product) {
      if (brands.length === 1) {
        product.requiredColumns.delete("g_c");
      }

      for (const column of product.requiredColumns) {
        const value = (row as (typeof transformedRows)[number])[
          column as keyof (typeof transformedRows)[number]
        ];
        const columnName = columnLabelByKey[column] ?? column;
        if (
          typeof value === "string" &&
          value?.length > 20 &&
          column === "additional_info"
        ) {
          errors.push(
            `La columna ${columnName} no puede tener mas de 20 caracteres(fila:${rowNum})`
          );
        }
        if (!value) {
          errors.push(
            `La columna ${columnName} es obligatoria y no esta en el archivo(fila:${rowNum})`
          );
        }
        if (column === "card_number") {
          const response = await fetch(
            `https://data.handyapi.com/bin/${row.card_number
              ?.toString()
              .replace(/\s/g, "")
              .slice(0, 8)}`
          );

          const json = await response?.json();

          let row_card_type = row.card_type ?? json?.Type;
          let row_card_brand = row.card_brand ?? json?.Scheme;
          if (!row_card_brand || !row_card_type) {
            errors.push(
              `No se pudo obtener (${!row_card_brand ? "Marca" : ""}, ${
                !row_card_type ? "Tipo" : ""
              }) de la tarjeta en fila: ${rowNum} \n`
            );
          }
          if (!row_card_brand) {
            row_card_brand = json?.Scheme;
          }
          if (!row_card_type) {
            row_card_type = json?.Type;
          }
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
  // biome-ignore lint/complexity/noForEach: <explanation>
  products.forEach((product) => {
    // Iterar sobre cada elemento del set requiredColumns del objeto actual
    // biome-ignore lint/complexity/noForEach: <explanation>
    product.requiredColumns.forEach((column) => {
      // Añadir cada columna al conjunto companyReqColumns
      companyReqColumns.add(column);
    });
  });

  const TableHeaders = recHeaders.filter(
    (header) =>
      companyReqColumns.has(header.key) ||
      header.key === "g_c" ||
      header.key === "product_number"
  );
  // autocompletar card_type y card_brand

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
  }
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "suba un archivo en formato xlsx",
  });
}

function trimObject(obj: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (typeof value === "string") {
        const t = value.trim();

        if (t === "") {
          return [key, null];
        }

        return [key, t];
      }

      return [key, value];
    })
  );
}
