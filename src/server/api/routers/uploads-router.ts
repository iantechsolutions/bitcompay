import { TRPCError } from "@trpc/server";
import { and, eq, or, desc, inArray, not } from "drizzle-orm";
import * as xlsx from "xlsx";
import { record, z } from "zod";
import { createId } from "~/lib/utils";
import postgres from "postgres";
const queryClient = postgres(env.POSTGRES_URL);
import * as schema from "~/server/db/schema";
import {
  columnLabelByKey,
  recHeaders,
  recRowsTransformer,
} from "~/server/uploads/validators";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import dayOfYear from "dayjs/plugin/dayOfYear";
import timezone from "dayjs/plugin/timezone";
import { env } from "~/env";
import { drizzle } from "drizzle-orm/postgres-js";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(dayOfYear);
dayjs.locale("es");

const db = drizzle(queryClient, { schema });

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
      return await db.transaction(async () => {
        const channels = await getCompanyProducts(companyId!);
        const brands = await getCompanyBrands(companyId!);

        const contents = await readUploadContents(
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
        channelName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await db.transaction(async () => {
        const contents = await readResponseUploadContents(
          input.uploadId,
          input.type,
          input.channelName
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
        channelName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const { records } = await readResponseUploadContents(
          input.uploadId,
          undefined,
          input.channelName
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
            const affiliate_number = record.affiliate_number || "";
            console.log("affiliate_number", affiliate_number);
            let subquery = tx
              .select({ id: schema.payments.id })
              .from(schema.payments)
              .where(eq(schema.payments.affiliate_number, affiliate_number))
              .orderBy(desc(schema.payments.createdAt))
              .limit(1);
            console.log("subquery", subquery, typeof subquery);
            await tx
              .update(schema.payments)
              .set({
                statusId: record.statusId,
                // payment_channel: input.channelName,
                payment_date: record.payment_date,
                additional_info: record.additional_info,
                recollected_amount: record.recollected_amount,
              })
              .where(
                or(
                  eq(schema.payments.invoice_number, invoiceNumber),
                  eq(schema.payments.affiliate_number, affiliate_number)
                )
              );
            const payment = await tx.query.payments.findFirst({
              where: eq(schema.payments.invoice_number, invoiceNumber),
              with: {
                comprobantes: {
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

            if (payment?.comprobantes?.family_group?.cc) {
              const currentAccount = payment?.comprobantes?.family_group?.cc;
              const lastEvent = currentAccount?.events.reduce(
                (prev, current) => {
                  return new Date(prev.createdAt) > new Date(current.createdAt)
                    ? prev
                    : current;
                }
              );

              const recollected_amount =
                records.find((x) => x.id === payment?.id)
                  ?.recollected_amount! ?? 0;
              console.log(
                "tributo",
                lastEvent?.current_amount,
                payment?.comprobantes?.importe!,
                record.collected_amount!,
                "lolo",
                recollected_amount
              );
              // if (!lastEvent) {
              //   throw new Error("No hay eventos en la cuenta corriente");
              // }
              const new_event = await tx.insert(schema.events).values({
                currentAccount_id: currentAccount?.id,
                event_amount: recollected_amount ?? 0,
                current_amount:
                  (lastEvent?.current_amount ?? 0) + recollected_amount,
                description: "Recaudacion",
                type: "REC",
              });
            }
            const ccORG = await db.query.currentAccount.findFirst({
              where: eq(
                schema.currentAccount.company_id,
                payment?.companyId ?? ""
              ),
              with: {
                events: true,
              },
            });
            let lastEvent = null;
            if (ccORG && ccORG.events.length > 0) {
              lastEvent = ccORG?.events.reduce((prev, current) => {
                return new Date(prev.createdAt) > new Date(current.createdAt)
                  ? prev
                  : current;
              });
            }
            // if (!lastEvent) {
            //   throw new Error(
            //     "No hay eventos en la cuenta corriente de la empresa"
            //   );
            // }
            const recollected_amount =
              records.find((x) => x.id === payment?.id)?.recollected_amount! ??
              0;

            const new_event = await tx.insert(schema.events).values({
              currentAccount_id: ccORG?.id,
              event_amount:
                // record.first_due_amount ??
                recollected_amount ?? 0,
              current_amount:
                (lastEvent?.current_amount ?? 0) + recollected_amount,
              description: "Recaudacion",
              type: "REC",
            });
          })
        );

        const mapComprobantes = new Map<string, number>();
        for (const record of records) {
          if (
            record.comprobante_id &&
            !mapComprobantes.has(record.comprobante_id)
          ) {
            mapComprobantes.set(
              record.comprobante_id,
              record.recollected_amount!
            );
          } else if (
            record.comprobante_id &&
            mapComprobantes.has(record.comprobante_id)
          ) {
            let current = mapComprobantes.get(record.comprobante_id);
            if (current) {
              current += record.recollected_amount!;
              mapComprobantes.set(record.comprobante_id, current);
            }
          }
        }
        console.log("mapComprobantes", mapComprobantes);
        for (const [key, value] of mapComprobantes) {
          console.log(value, key);
          const missing_payments = await tx.query.payments.findMany({
            where: and(
              eq(schema.payments.comprobante_id, key),
              not(
                inArray(
                  schema.payments.id,
                  records.map((r) => r.id!)
                )
              )
            ),
          });
          console.log(missing_payments, missing_payments.length);
          if (missing_payments.length > 0) {
            let missing_recollected_amount = 0;
            missing_payments.forEach((payment) => {
              missing_recollected_amount += payment.recollected_amount ?? 0;
            });
            const current_amount = value;
            mapComprobantes.set(
              key,
              (current_amount ?? 0) + missing_recollected_amount
            );
          }
          const comprobante = await tx.query.comprobantes.findFirst({
            where: eq(schema.comprobantes.id, key),
          });
          console.log("comprobante", comprobante);

          const estado = comprobante?.importe! > value ? "Parcial" : "Pagada";
          console.log("key", key);
          console.log("mapComprobantes", mapComprobantes);
          console.log("estado", estado);
          await tx
            .update(schema.comprobantes)
            .set({
              estado: estado,
            })
            .where(eq(schema.comprobantes.id, key));
        }
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
          console.log("aca 15");
          const defaultStatus = await tx.query.paymentStatus.findFirst({
            where: eq(schema.paymentStatus.code, "91"),
          });
          console.log("aca 16");
          console.log(rows[0]);
          await tx.insert(schema.payments).values(
            rows.map((row) => ({
              id: createId(),
              userId: ctx.session.user.id,
              documentUploadId: upload.id,
              companyId: companyId ?? "",
              g_c: row.g_c,
              name: row.name,
              fiscal_id_type: row.fiscal_id_type,
              fiscal_id_number: row.fiscal_id_number,
              du_type: row.du_type,
              du_number: row.du_number,
              product_number: row.product_number,
              invoice_number: row.invoice_number ?? 0,
              period: row.period,
              first_due_amount: row.first_due_amount,
              first_due_date: row.first_due_date,
              second_due_amount: null,
              second_due_date: null,
              additional_info: row.additional_info ?? null,
              // payment_channel: row.payment_channel ?? null,
              payment_date: row.payment_date ?? null,
              collected_amount: row.collected_amount ?? null,
              cbu: row.cbu ?? null,
              statusId: defaultStatus?.id ?? "",
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
  id: string,
  inputType: string | undefined,
  channelName: string
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

  console.log("channelName", channelName);
  const response = await fetch(upload.fileUrl);
  const fileContent = await response.text();
  const lines: string[] = fileContent.trim().split(/\r?\n/);
  // encabezado
  console.log("bosta", fileContent);
  lines.shift();
  lines.pop();

  let total_rows = 2;
  let recordIndex = 1;
  const records = [];

  if (channelName == "PAGOFACIL") {
    for (const line of lines) {
      const recordValues = line.trim().split(/\s{2,}/);
      console.log("recordValues", recordValues);
      const largeNumber = recordValues[0];
      let affiliate_number = recordValues[1];
      let importe_string = recordValues[3];

      let importe_final = parceImporte(importe_string ?? "0");
      const payment_date = recordValues[0]?.slice(1, 9);

      const invoice_number = largeNumber?.slice(16, 21).replace(/^0+/, "");
      // const fiscal_id_number = largeNumber?.slice(84, 104);
      // const invoice_number = largeNumber?.slice(16, 21);
      // const importe_final = largeNumber?.slice(48, 58);
      affiliate_number = affiliate_number?.slice(0, 21).replace(/^0+/, "");
      console.log(invoice_number!.replace(/^0+/, ""), "payments_date");
      console.log(
        "El numbero",
        affiliate_number,
        importe_string,
        importe_final
      );
      const day = payment_date!.slice(0, 2);
      const month = payment_date!.slice(2, 4);
      const year = payment_date!.slice(4, 8);

      console.log("testamento", payment_date, day, month, year);
      const date = dayjs(`${year}${month}${day}`, "YYYYMMDD").format(
        "YYYY-MM-DD"
      );

      const invoiceNumberCleaned = invoice_number
        ? Number(invoice_number.replace(/^0+/, ""))
        : undefined;

      console.log("mate", affiliate_number, invoiceNumberCleaned);
      if (affiliate_number && invoiceNumberCleaned) {
        const original_transaction = await db.query.payments.findFirst({
          where: and(
            eq(schema.payments.affiliate_number, affiliate_number),
            eq(schema.payments.invoice_number, invoiceNumberCleaned)
          ),
        });
        if (original_transaction) {
          original_transaction.payment_date = dayjs(
            date,
            "YYYY-MM-DD"
          ).toDate();

          original_transaction.collected_amount =
            original_transaction.first_due_amount! +
            original_transaction.second_due_amount!;
          original_transaction.recollected_amount =
            (original_transaction.recollected_amount ?? 0) + importe_final;

          let estado = await obtenerEstado(
            original_transaction.recollected_amount,
            original_transaction.first_due_amount,
            original_transaction.second_due_amount
          );

          original_transaction.statusId = estado;

          records.push(original_transaction);
        }
      } else {
        throw Error("cannot read invoice number");
      }

      total_rows++;
      recordIndex++;
    }
  }
  if (channelName == "PAGOMISCUENTAS") {
    for (const line of lines) {
      const recordValues = line.trim().split(/\s{2,}/);
      console.log("recordValues", recordValues);

      const largeNumber = recordValues[0];
      const largeNumber2 = recordValues[1];

      const invoice_number = largeNumber2;
      const importe_final = recordValues[2]?.slice(17, 28);
      const affiliate_number = largeNumber?.slice(1, 16).replace(/^0+/, "");
      const payment_date = recordValues[2]?.slice(9, 17);
      const year = payment_date!.slice(0, 4);
      const month = payment_date!.slice(4, 6);
      const day = payment_date!.slice(6, 8);

      console.log("testamento", payment_date, year, month, day);
      console.log(Number(importe_final), "testtt", invoice_number);
      const date = dayjs(`${year}${month}${day}`, "YYYYMMDD").format(
        "YYYY-MM-DD"
      );
      console.log(date, "boludon", affiliate_number);

      const invoiceNumberCleaned = invoice_number
        ? Number(invoice_number.replace(/^0+/, ""))
        : undefined;

      if (invoiceNumberCleaned && affiliate_number) {
        const original_transaction = await db.query.payments.findFirst({
          where: and(
            eq(schema.payments.affiliate_number, affiliate_number),
            eq(schema.payments.invoice_number, invoiceNumberCleaned)
          ),
        });
        if (original_transaction) {
          original_transaction.payment_date = dayjs(
            date,
            "YYYY-MM-DD"
          ).toDate();
          original_transaction.collected_amount =
            (original_transaction.first_due_amount ?? 0) +
            (original_transaction.second_due_amount ?? 0);

          original_transaction.recollected_amount = parceImporte(
            importe_final ?? "0"
          );

          let estado = await obtenerEstado(
            original_transaction.recollected_amount,
            original_transaction.first_due_amount,
            original_transaction.second_due_amount
          );

          original_transaction.statusId = estado;
          records.push(original_transaction);
        }
      } else {
        throw Error("cannot read invoice number");
      }

      total_rows++;
      recordIndex++;
    }
  }
  if (channelName === "RAPIPAGO") {
    for (const line of lines) {
      const recordValues = line.trim().split(/\s{2,}/);
      console.log("recordValues", recordValues);

      const affiliate_number = recordValues[0]
        ?.slice(23, 42)
        .replace(/^0+/, "");
      const invoice_number = recordValues[0]?.slice(42, 62).replace(/^0+/, "");

      const importe_final = recordValues[0]?.slice(9, 23);

      const payment_date = recordValues[0]?.slice(0, 8);
      const year = payment_date!.slice(0, 4);
      const month = payment_date!.slice(4, 6);
      const day = payment_date!.slice(6);

      const date = dayjs(`${year}${month}${day}`, "YYYYMMDD").format(
        "YYYY-MM-DD"
      );

      console.log(payment_date, "ES ESTAAA");

      console.log(date, "ES ESTAAA");
      console.log(importe_final);
      console.log("affiliate_number", affiliate_number);
      console.log("invoice_number", invoice_number);
      const invoiceNumberCleaned = invoice_number
        ? Number(invoice_number.replace(/^0+/, ""))
        : undefined;

      if (affiliate_number && invoiceNumberCleaned) {
        const original_transaction = await db.query.payments.findFirst({
          where: and(
            eq(schema.payments.affiliate_number, affiliate_number),
            eq(schema.payments.invoice_number, invoiceNumberCleaned)
          ),
        });
        if (original_transaction) {
          original_transaction.payment_date = dayjs(
            date,
            "YYYY-MM-DD"
          ).toDate();
          original_transaction.collected_amount =
            original_transaction.first_due_amount! +
            (original_transaction.second_due_amount ?? 0);

          original_transaction.recollected_amount =
            (original_transaction.recollected_amount! ?? 0) +
            parceImporte(importe_final!);

          let estado = await obtenerEstado(
            original_transaction.recollected_amount,
            original_transaction.first_due_amount,
            original_transaction.second_due_amount
          );

          original_transaction.statusId = estado;

          records.push(original_transaction);
        }
      } else {
        throw Error("cannot read invoice number");
      }

      total_rows++;
      recordIndex++;
    }
  }
  if (channelName === "DEBITO AUTOMATICO") {
    //Cómo leés los archivos de tarjetas de crédito
    //(RDEBLIQC y RDEBLIMC):
    // (RDEBLIQD y LDEBLIQD)
    let importe_final;
    let invoice_number;
    let mensaje;
    let payment_date;
    let new_tarjeta;
    let failed_error;
    let news_type;
    let affiliate_number;
    let news_description;
    let affiliate_name;
    for (const line of lines) {
      const recordValues = line.trim().split(/\s{2,}/);
      console.log("recordValues2", recordValues);
    }

    for (const line of lines) {
      const recordValues = line.trim().split(/\s{2,}/);
      console.log("recordValues", recordValues);

      //NOVEDADES DE de tarjetas de crédito!!!
      if (fileContent.startsWith("0RNOVDEBC")) {
        console.log("Golpes al ego");

        news_type = recordValues[1]?.slice(0, 1);
        affiliate_number = recordValues[2]?.slice(0, 15).replace(/^0+/, "");
        // affiliate_number = recordValues[1]?.slice(21, 36).replace(/^0+/, "");

        affiliate_name = recordValues[1]?.slice(36);
        if ((news_type = "1")) {
          news_description = "Alta";
        }
        if ((news_type = "2")) {
          news_description = "Baja";
        }
        if ((news_type = "3")) {
          news_description = "Stop Debit";
        }
        //
        console.log("affiliate_number: ", affiliate_number);
        console.log("affiliate_name: ", affiliate_name);

        console.log("Descripcion novedad: ", news_type);
        console.log("Descripcion novedad: ", news_description);
      } else if (
        fileContent.startsWith("0RDEBLIQD") ||
        fileContent.startsWith("0RDEBLIMD") ||
        fileContent.startsWith("0LDEBLIQD") ||
        fileContent.startsWith("0LDEBLIMD")
      ) {
        //Cómo leés los archivos de tarjetas de crédito
        //TARJETAS DE CREDITO
        console.log("elemental");

        invoice_number = recordValues[1]?.slice(0, 8).replace(/^0+/, "");
        new_tarjeta = recordValues[0]?.slice(0, 16);
        affiliate_number = recordValues[2]?.slice(0, 15).replace(/^0+/, "");
        importe_final = recordValues[1]?.slice(20, 35);

        failed_error = recordValues[2]?.slice(0, 3);
        mensaje = recordValues[2]?.slice(3, 43);
        payment_date = recordValues[1]?.slice(8, 16);

        //Cómo leés los archivos de tarjetas de débito Visa:
      } else if (
        fileContent.startsWith("0RDEBLIQC") ||
        fileContent.startsWith("0RDEBLIMC")
      ) {
        console.log("Eureka");

        const recordValues = line.trim().split(/\s{2,}/);

        importe_final = recordValues[1];
        invoice_number = recordValues[0]?.slice(42, 50).replace(/^0+/, "");
        affiliate_number = recordValues[2]?.slice(0, 15).replace(/^0+/, "");
        mensaje = recordValues[3]?.slice(5, 35);

        if (recordValues[5]) {
          if (recordValues[5].length > 20) {
            new_tarjeta = recordValues[5]?.slice(0, 16);
            payment_date = recordValues[5]?.slice(22, 28);
          } else {
            payment_date = recordValues[5]?.slice(6, 12);
          }
        } else {
          new_tarjeta = recordValues[0]?.slice(26, 42);
          payment_date = recordValues[4]?.slice(6, 12);
        }
      }

      console.log(invoice_number, "largeNumber");
      console.log(new_tarjeta, "tarjeta");
      console.log(payment_date, "payment_date");
      console.log(failed_error, "failed_error");

      console.log("mensaje", mensaje);
      console.log(affiliate_number, "affiliate_number");
      // console.log(recordValues[4], "importe_final");

      const day = payment_date?.slice(0, 2);
      const month = payment_date?.slice(2, 4);
      const year = "20" + payment_date?.slice(4, 6);

      const date = dayjs(`${year}${month}${day}`, "YYYYMMDD").format(
        "YYYY-MM-DD"
      );

      console.log(date, "date");
      const invoiceNumberCleaned = invoice_number
        ? Number(invoice_number.replace(/^0+/, ""))
        : undefined;
      try {
        let original_transaction;
        if (affiliate_number && invoiceNumberCleaned) {
          original_transaction = await db.query.payments.findFirst({
            where: and(
              eq(schema.payments.affiliate_number, affiliate_number),
              eq(schema.payments.invoice_number, invoiceNumberCleaned)
            ),
          });
        } else if (invoiceNumberCleaned) {
          original_transaction = await db.query.payments.findFirst({
            where: eq(schema.payments.invoice_number, invoiceNumberCleaned),
          });
        }

        if (original_transaction) {
          original_transaction.payment_date = dayjs(
            date,
            "YYYY-MM-DD"
          ).toDate();
          original_transaction.collected_amount =
            original_transaction.first_due_amount! +
            original_transaction.second_due_amount!;
          if (mensaje) {
            original_transaction.additional_info = mensaje;
          }
          original_transaction.recollected_amount =
            (original_transaction.recollected_amount! ?? 0) +
            parceImporte(importe_final!);

          let estado = await obtenerEstado(
            original_transaction.recollected_amount,
            original_transaction.first_due_amount,
            original_transaction.second_due_amount
          );

          original_transaction.statusId = estado;
          records.push(original_transaction);
        }
      } catch {
        throw Error("cannot read invoice number");
      }

      total_rows++;
      recordIndex++;
    }
  }
  if (channelName == "DEBITO DIRECTO CBU") {
    for (const line of lines) {
      if (recordIndex === 1) {
        const recordValues = line.trim().split(/\s{2,}/);

        //trato el ultimo elemento que esta junto nro de factura y estado de pago
        const largeNumber = recordValues[2];

        const status_code = largeNumber?.slice(34, 36);
        const importe = largeNumber?.slice(22, 39);
        const observacion = recordValues[5]?.slice(16, 56);

        const payment_date = recordValues[4];

        const day = payment_date?.slice(6, 8);
        const month = payment_date?.slice(4, 6);
        const year = payment_date?.slice(0, 4);
        const date = dayjs(`${year}${month}${day}`, "YYYYMMDD").format(
          "YYYY-MM-DD"
        );

        const importe_int = importe?.slice(0, importe.length - 2);
        const importe_dec = importe?.slice(importe.length - 2);
        const parte_entera = parseInt(importe_int!);
        const parte_dec = parseInt(importe_dec!);
        const importe_final = parte_entera + parte_dec / 100;

        const stringInvoiceNumber =
          recordValues[recordValues.length - 1] ?? null;

        if (!stringInvoiceNumber) {
          throw new Error("there is no invoice number");
        }

        const invoice_number = stringInvoiceNumber.slice(10, 15) ?? null;
        console.log("invoice_number", invoice_number);

        const errorStatus = await db.query.paymentStatus.findFirst({
          where: eq(schema.paymentStatus.code, "04"),
        });
        if (invoice_number) {
          const original_transaction = await db.query.payments.findFirst({
            where: eq(
              schema.payments.invoice_number,
              Number.parseInt(invoice_number)
            ),
          });
          if (original_transaction) {
            original_transaction.payment_date = dayjs(
              date,
              "YYYY-MM-DD"
            ).toDate();
            original_transaction.additional_info = observacion ?? "";
            original_transaction.recollected_amount = importe_final;
            original_transaction.collected_amount =
              original_transaction.first_due_amount! +
              (original_transaction.second_due_amount ?? 0);

            let estado = await obtenerEstado(
              original_transaction.recollected_amount,
              original_transaction.first_due_amount,
              original_transaction.second_due_amount
            );

            original_transaction.statusId = estado;

            console.log("statusCode", status_code);
            console.log("status", original_transaction.statusId);
            console.log("importeString", importe_int, importe_dec);
            console.log("parte_entera", parte_entera);
            console.log("parte_dec", parte_dec);
            console.log("importe", importe_final);
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
  }
  console.log("darius", records.length);
  return { upload, records, total_rows, header: recHeaders };
}

type ProductsOfCompany = Awaited<ReturnType<typeof getCompanyProducts>>;
type BrandsOfCompany = Awaited<ReturnType<typeof getCompanyBrands>>;

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
async function readUploadContents(
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
  console.log("aca 1");
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
  console.log("aca 2");
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
  console.log("aca 3");
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
  console.log("aca 4");

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
  console.log("aca 5");
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
  console.log("aca 6");
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
    console.log("aca 7");
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
    console.log("aca 8");
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
          console.log("aca");
          console.log(column);
          console.log(row);
          errors.push(
            `La columna ${columnName} es obligatoria y no esta en el archivo(fila:${rowNum})`
          );
        }
        console.log("aca 10");
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
    console.log("aca 11");
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
  console.log("aca 12");
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

function parceImporte(number: string) {
  const formattedNumber = parseFloat((parseInt(number) / 100).toFixed(2));
  console.log("number, ", formattedNumber);

  return formattedNumber;
}

async function obtenerEstado(
  importe_final: number,
  first_due_amount: number | null,
  second_due_amount: number | null
): Promise<string> {
  const suma_deuda = (first_due_amount ?? 0) + (second_due_amount ?? 0);
  let estado;

  switch (true) {
    case importe_final >= suma_deuda:
      estado = await db.query.paymentStatus.findFirst({
        where: eq(schema.paymentStatus.code, "00"),
      });
      break;

    case importe_final < suma_deuda && importe_final > 0:
      estado = await db.query.paymentStatus.findFirst({
        where: eq(schema.paymentStatus.code, "15"),
      });
      break;

    default:
      estado = await db.query.paymentStatus.findFirst({
        where: eq(schema.paymentStatus.code, "03"),
      });
      break;
  }
  console.log("benito", suma_deuda, importe_final, estado);

  return estado?.id ?? "MwiWSY_282T-sISz2uWED";
}
