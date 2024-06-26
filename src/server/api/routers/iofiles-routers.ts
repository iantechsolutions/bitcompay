import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { and, eq, inArray, isNull, desc, not } from "drizzle-orm";
import { z } from "zod";
import { type DBTX, db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import dayOfYear from "dayjs/plugin/dayOfYear";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { createId } from "~/lib/utils";
import { utapi } from "~/server/uploadthing";
import type { RouterOutputs } from "~/trpc/shared";
import { Payment, establishments } from "~/server/db/schema";
import { Factura } from "~/app/dashboard/[companyId]/billing/manual_issuance/facturaGenerada";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(dayOfYear);
dayjs.locale("es");

export const iofilesRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        companyId: z.string(),
        brandId: z.string(),
        fileName: z.string().max(12).nullable().optional(),
        card_brand: z.string().nullable().optional(),
        card_type: z.string().nullable().optional(),
        presentation_date: z.date().nullable().optional(),
        concept: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const companyId = ctx.session.orgId;
      let text: string = "";
      await db.transaction(async (db) => {
        // Obtenemos la marca y el canal
        const { brand, channel } = await getBrandAndChannel(db, input);
        // Productos del canal
        const productsNumbers = channel.products.map((p) => p.product.number);
        // estado completado:
        const genFileStatus = await db.query.paymentStatus.findFirst({
          where: eq(schema.paymentStatus.code, "92"),
        });

        const paymentsFull = await db.query.payments.findMany({
          where: and(
            eq(schema.payments.companyId, input.companyId),
            eq(schema.payments.g_c, brand.number),
            inArray(schema.payments.product_number, productsNumbers)
          ),
        });
        const payments = paymentsFull.filter(
          (p) => p.genChannels.includes(channel.id) === false
        );

        const regexPagoFacil = /pago\s*f[aá]cil/i;
        // Generamos el archivo de salida segun el canal
        if (channel.name.includes("DEBITO DIRECTO")) {
          const generateInput = {
            channelId: channel.id,
            companyId: companyId!,
            fileName: input.fileName!,
            concept: input.concept,
            redescription: brand.redescription,
          };
          text = generateDebitoDirecto(generateInput, payments);
        } else if (channel.name.includes("PAGOMISCUENTAS")) {
          const generateInput = {
            channelId: channel.id,
            companyId: companyId!,
            fileName: input.fileName!,
            concept: input.concept,
            redescription: brand.redescription,
          };
          text = generatePagomiscuentas(generateInput, brand.name, payments);
        } else if (channel.name.match(regexPagoFacil)) {
          const generateInput = {
            channelId: channel.id,
            companyId: companyId!,
            fileName: input.fileName!,
            concept: input.concept,
            redescription: brand.redescription,
          };
          text = await generatePagoFacil(generateInput, payments);
        } else if (channel.name.includes("RAPIPAGO")) {
          const generateInput = {
            channelId: channel.id,
            companyId: companyId!,
            fileName: input.fileName!,
            concept: input.concept,
            redescription: brand.redescription,
          };
          text = generateRapiPago(generateInput, payments);
        } else if (channel.name.includes("DEBITO AUTOMATICO")) {
          if (
            !input.card_brand ||
            !input.card_type ||
            !input.presentation_date
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `card_brand, card_type and presentation_date are required for DEBITO AUTOMATICO`,
            });
          }

          const establishment = await db.query.establishments.findFirst({
            where: and(
              eq(schema.establishments.brandId, input.brandId),
              eq(schema.establishments.flag, input.card_brand)
            ),
          });
          if (!establishment) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `establishment not found`,
            });
          }
          text = generateDebitoAutomatico({
            payments,
            EstablishmentNumber: establishment.establishment_number,
            cardType: input.card_type,
            flag: input.card_brand,
            presentationDate: input.presentation_date,
          });
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `channel ${channel?.name} is not supported`,
          });
        }

        // Subimos el archivo a Uploadthing
        // const uploaded = await utapi.uploadFiles(
        //   new File([text], input.fileName, { type: "text/plain" })
        // );

        // Guardamos el archivo en la base de datos
        // const id = createId();

        // await db.insert(schema.uploadedOutputFiles).values({
        //   id,
        //   brandId: brand.id,
        //   channelId: channel.id,
        //   companyId: input.companyId,
        //   fileName: input.fileName,
        //   fileSize: text.length,
        //   fileUrl: uploaded.data!.url,
        //   userId: ctx.session.user.id,
        // });

        // Actualizamos los pagos con el archivo generado
        // si el archivo tiene todos sus archivos generados:

        for (const payment of payments) {
          const product = await db.query.products.findFirst({
            where: eq(schema.products.number, payment.product_number),
            with: {
              channels: {
                with: {
                  channel: {
                    columns: {
                      id: true,
                    },
                  },
                },
              },
            },
          });
          console.log("product", product);
          const channelsList = product?.channels.map((c) => {
            return c.channel.id;
          });

          console.log("channelsList", channelsList);
          const processedPayment =
            channelsList?.every((item) => payment.genChannels.includes(item)) &&
            payment.genChannels.length === channelsList?.length;
          console.log("processedPayment", processedPayment);
          console.log(payment.id);

          if (
            !processedPayment &&
            !payment.genChannels.includes(channel?.id!)
          ) {
            const newGenChannles = [...payment.genChannels, channel.id];
            console.log("updating gen Channels");
            try {
              if (payment.genChannels.length === channelsList?.length! - 1) {
                await db
                  .update(schema.payments)
                  .set({
                    genChannels: newGenChannles,
                    statusId: genFileStatus?.id,
                  })
                  .where(eq(schema.payments.id, payment.id));
              } else {
                await db
                  .update(schema.payments)
                  .set({
                    genChannels: newGenChannles,
                  })
                  .where(eq(schema.payments.id, payment.id));
                console.log(
                  "gen channes updated",
                  // updated_payment,
                  "old: ",
                  payment.genChannels
                );
              }
            } catch (e) {
              console.log(e);
            }
          }
        }
      });
      return text;
    }),
  list: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        companyId: z.string(),
        brandId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await db.query.uploadedOutputFiles.findMany({
        where: and(
          eq(schema.uploadedOutputFiles.channelId, input.channelId),
          eq(schema.uploadedOutputFiles.companyId, input.companyId),
          eq(schema.uploadedOutputFiles.brandId, input.brandId)
        ),
      });
    }),
});

function generateDebitoDirecto(
  input: {
    channelId: string;
    fileName: string;
    concept: string;
    redescription: string;
  },
  transactions: RouterOutputs["transactions"]["list"]
) {
  let currentDate = dayjs().utc().tz("America/Argentina/Buenos_Aires");
  const currentHour = currentDate.hour();
  const currentMinutes = currentDate.minute();
  if (currentHour > 16 || (currentHour === 16 && currentMinutes > 0)) {
    currentDate = currentDate.add(1, "day");
  }
  const dateYYYYMMDD = currentDate.format("YYYYMMDD");
  const fileName = formatString(" ", input.fileName, 12, true);
  const redDescription = formatString(" ", input.redescription, 10, true);
  let text = `411002513${dateYYYYMMDD}${dateYYYYMMDD}00170356730103179945${redDescription}ARS0${fileName}BITCOM SRL${" ".repeat(
    26
  )}20${" ".repeat(141)}\r\n`;
  let total_records = 1;
  let total_operations = 0;
  let total_collected = 0;
  for (const transaction of transactions) {
    const date = dayjs(transaction.first_due_date);
    const year = date.year();
    const monthName = date.format("MMMM").toUpperCase();
    const period = formatString(" ", `${monthName} ${year}`, 22, true);
    const dateYYYYMMDD = date.format("YYYYMMDD");
    let collected_amount;
    if (transaction.collected_amount) {
      collected_amount = transaction.collected_amount?.toString();
    } else if (
      transaction.first_due_amount ||
      transaction.first_due_amount === 0
    ) {
      collected_amount = transaction.first_due_amount?.toString();
    } else {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: ` no hay informacion sobre importe a cobrar (invoice number:${transaction.invoice_number}`,
      });
    }
    const collectedAmount = formatString("0", collected_amount, 15, false);
    const fiscalNumber = formatString(
      " ",
      transaction.fiscal_id_number!.toString(),
      22,
      true
    );
    if (!transaction.cbu) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: ` no hay informacion sobre CBU (invoice number:${transaction.invoice_number}`,
      });
    }
    const invoice_number = formatString(
      "0",
      transaction.invoice_number!.toString(),
      15,
      false
    );
    const CBU = transaction.cbu;
    text += `421002513  ${fiscalNumber}${CBU}${collectedAmount}00    ${period}${dateYYYYMMDD}  ${invoice_number}${" ".repeat(
      127
    )}\r\n`;
    let name;
    if (transaction.name!.length > 36) {
      name = transaction.name!.slice(0, 36);
    } else {
      name = formatString(" ", transaction.name!, 36, true);
    }
    text += `422002513  ${fiscalNumber}${name}${" ".repeat(181)}\r\n`;
    text += `423002513  ${fiscalNumber}${" ".repeat(217)}\r\n`;
    const concept = formatString(
      " ",
      transaction.additional_info ?? "",
      40,
      true
    );
    text += `424002513  ${fiscalNumber}${concept}${" ".repeat(177)}\r\n`;

    total_records += 4;
    total_operations += 1;
    total_collected +=
      transaction.collected_amount ?? transaction.first_due_amount ?? 0;
  }

  const total_collected_string = formatString(
    "0",
    total_collected?.toString(),
    15,
    false
  );
  const total_operations_string = formatString(
    "0",
    total_operations?.toString(),
    8,
    false
  );
  const total_records_string = formatString(
    "0",
    total_records?.toString(),
    10,
    false
  );

  text += `491002513${total_collected_string}${total_operations_string}${total_records_string}${" ".repeat(
    208
  )}\r\n`;

  return text;
}

function generatePagomiscuentas(
  input: {
    channelId: string;
    companyId: string;
    fileName: string;
    concept: string;
    redescription: string;
  },
  brandName: string,
  transactions: RouterOutputs["transactions"]["list"]
) {
  const codeCompanyMap: Record<string, string> = {
    "red argentina de sanatorios": "REDA",
    "cristal salud": "AL6N",
  };
  const dateAAAAMMDD = dayjs().locale("es").format("YYYYMMDD");
  const companyCode =
    codeCompanyMap[brandName.toLowerCase() as keyof typeof codeCompanyMap];

  if (!companyCode) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `company code not found in this brand`,
    });
  }
  //header
  let text = `0400${companyCode}${dateAAAAMMDD}${"0".repeat(264)}\n`;
  let total_collected = 0;
  for (const transaction of transactions) {
    // registro
    const fiscal_id_number = formatString(
      " ",
      transaction.fiscal_id_number!.toString(),
      19,
      true
    );
    const invoice_number = formatString(
      " ",
      transaction.invoice_number.toString(),
      20,
      true
    );
    const first_due_date = dayjs(transaction.first_due_date).format("YYYYMMDD");
    const first_due_amount = formatString(
      "0",
      transaction.first_due_amount
        ? transaction.first_due_amount?.toString()
        : "",
      9,
      false
    );
    const second_due_date = dayjs(transaction.second_due_date).format(
      "YYYYMMDD"
    );
    const second_due_amount = formatString(
      "0",
      transaction.second_due_amount
        ? transaction.second_due_amount?.toString()
        : "",
      9,
      false
    );
    const ticketMessage = formatString(
      " ",
      transaction.additional_info ?? "",
      40,
      true
    );
    const displayMessage = formatString(
      " ",
      `${input.concept}-${dayjs
        .utc(transaction.period)
        .locale("es")
        .format("MM-YYYY")}`,
      15,
      true
    );
    text += `5${fiscal_id_number}${invoice_number}0${first_due_date}${first_due_amount}00${second_due_date}${second_due_amount}00${"0".repeat(
      38
    )}${fiscal_id_number}${ticketMessage}${displayMessage}${" ".repeat(
      60
    )}${"0".repeat(29)}\n`;

    total_collected += transaction.first_due_amount!;
  }
  // trailer
  const total_collected_string = formatString(
    "0",
    total_collected.toString(),
    14,
    false
  );
  const total_records_string = formatString(
    "0",
    transactions.length.toString(),
    7,
    false
  );
  text += `9400${companyCode}${dateAAAAMMDD}${total_records_string}${"0".repeat(
    7
  )}${total_collected_string}00${"0".repeat(234)}\n`;

  return text;
}

async function generatePagoFacil(
  _input: {
    channelId: string;
    companyId: string;
    fileName: string;
    concept: string;
    redescription: string;
  },
  transactions: RouterOutputs["transactions"]["list"]
): Promise<string> {
  let text = "";
  //header
  const date = dayjs().format("DDMMYYYY");
  const hours = dayjs().format("HHmmss");
  const companyName = formatString(" ", "BITCOM SRL", 40, true);
  const originName = formatString(" ", "PAGO FACIL", 10, true);
  const records_number = formatString(
    " ",
    transactions.length.toString(),
    9,
    true
  );
  const utility = "";
  text += `01${records_number}A\r\n`;
  let total_records = 0;
  let total_collected = 0;
  for (const transaction of transactions) {
    const fiscal_id_number = formatString(
      " ",
      transaction.fiscal_id_number!.toString(),
      11,
      true
    );
    const invoice_number = formatString(
      "0",
      transaction.invoice_number.toString(),
      6,
      false
    );
    const first_due_date = dayjs(transaction.first_due_date).format("DDMMYYYY");
    const first_due_amount = formatString(
      "0",
      transaction.first_due_amount
        ? transaction.first_due_amount?.toString()
        : "",
      10,
      false
    );
    const _CBU = transaction.cbu;
    const terminal_id = "123456";
    const seq_terminal = "1234";
    // codigo de barras
    const service_company = "3509";
    const dayOfYear = dayjs(transaction.first_due_date).dayOfYear();
    const first_due_amount_bar_code = formatString(
      "0",
      transaction.first_due_amount!.toString(),
      6,
      false
    );
    const first_due_date_bar_code = first_due_date.slice(-2) + dayOfYear;
    const second_due_amount_charge = "000330";
    const bar_code = `${service_company}${first_due_amount_bar_code}00${first_due_date_bar_code}${fiscal_id_number}0${second_due_amount_charge}${first_due_date.slice(
      2
    )}00`;
    //fin codigo de barras
    text += `3${date}${"0".repeat(6)}${invoice_number}10${formatString(
      " ",
      bar_code,
      60,
      true
    )}${fiscal_id_number}PES${first_due_amount}00${terminal_id}${date}${hours}${seq_terminal} PESE${" ".repeat(
      29
    )}${formatString(
      "0",
      transaction.first_due_amount
        ? transaction.first_due_amount?.toString()
        : "",
      13,
      false
    )}00\r\n`;
    total_records++;
    total_collected += transaction.first_due_amount!;
  }
  const total_records_string = formatString(
    "0",
    total_records.toString(),
    7,
    false
  );
  const total_collected_string = formatString(
    "0",
    total_collected.toString(),
    12,
    false
  );
  text += `9${"0".repeat(8)}${"0".repeat(12)}${"0".repeat(
    7
  )}${total_records_string}${total_collected_string}${"0".repeat(143)}`;
  return text;
}
function generateRapiPago(
  _input: {
    channelId: string;
    companyId: string;
    fileName: string;
    concept: string;
    redescription: string;
  },
  transactions: RouterOutputs["transactions"]["list"]
) {
  const currentDate = dayjs().format("YYYYMMDD");
  let text = `081400${currentDate}${"0".repeat(76)}\n`;
  let total_records = 0;
  let total_collected = 0;

  for (const transaction of transactions) {
    const fiscal_id_number = formatString(
      "0",
      transaction.fiscal_id_number!.toString(),
      19,
      false
    );
    const invoice_number = formatString(
      "0",
      transaction.invoice_number.toString(),
      20,
      false
    );
    const first_due_date = dayjs(transaction.first_due_date).format("YYYYMMDD");
    const first_due_amount = formatString(
      "0",
      transaction.first_due_amount
        ? transaction.first_due_amount?.toString()
        : "",
      9,
      false
    );
    const second_due_date = dayjs(
      transaction.second_due_date
        ? transaction.second_due_date
        : transaction.first_due_date
    ).format("YYYYMMDD");
    const second_due_amount = formatString(
      "0",
      transaction.second_due_amount
        ? transaction.second_due_amount?.toString()
        : "",
      9,
      false
    );
    text += `5${fiscal_id_number}${invoice_number}0${first_due_date}${first_due_amount}00${second_due_date}${second_due_amount}00${"0".repeat(
      11
    )}\n`;
    total_records++;
    total_collected += transaction.first_due_amount ?? 0;
  }
  const total_records_string = formatString(
    "0",
    total_records.toString(),
    7,
    false
  );
  const total_collected_string = formatString(
    "0",
    total_collected.toString(),
    9,
    false
  );
  text += `981400${currentDate}${total_records_string}${"0".repeat(
    7
  )}${total_collected_string}00${"0".repeat(11)}${"0".repeat(40)}`;
  return text;
}

function formatString(
  char: string,
  string: string,
  limit: number,
  final: boolean
) {
  if (string.length > limit) {
    string = string.substring(0, limit);
  }
  if (final) {
    return string.concat(char.repeat(limit - string.length));
  }
  return char.repeat(limit - string.length).concat(string);
}

export async function getBrandAndChannel(
  db: DBTX,
  input: { channelId: string; companyId: string; brandId: string }
) {
  const brand = await db.query.brands.findFirst({
    where: eq(schema.brands.id, input.brandId),
  });

  // Si la marca no existe, no podemos continuar
  if (!brand) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `brand ${input.brandId} does not exist in company`,
    });
  }

  const channel = await db.query.channels.findFirst({
    where: eq(schema.channels.id, input.channelId),
    with: {
      products: {
        with: {
          product: {
            columns: {
              number: true,
            },
          },
        },
      },
    },
  });

  // Si el canal no existe, no podemos continuar
  if (!channel) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `channel ${input.channelId} does not exist in company ${input.companyId}`,
    });
  }

  return { brand, channel };
}

type generateDAprops = {
  payments: Payment[];
  presentationDate: Date;
  EstablishmentNumber: number;
  cardType: string;
  flag: string;
};
function generateDebitoAutomatico(props: generateDAprops) {
  const FileNameMap: Record<string, string> = {
    "Visa Credito": "DEBLIQC_",
    "Visa Debito": "DEBLIQD_",
    "Mastercard Credito": "DEBLIMC_",
  };
  const key = `${props.flag} ${props.cardType}`;
  const fileName = FileNameMap[key];
  const presentationDate = dayjs(props.presentationDate).format("YYYYMMDD");
  const hour = dayjs().format("HHmm");
  let header = `0${fileName}${
    props.EstablishmentNumber
  }900000    ${presentationDate}${hour}0  ${" ".repeat(55)}*\r\n`;
  let body = "";
  let total_collected = 0;
  for (const payment of props.payments) {
    const importe = payment.collected_amount ?? payment.first_due_amount;
    const importeString = formatString("0", importe!.toString(), 15, false);
    const registrationCode = payment.is_new ? "E" : " ";
    body += `1${payment.card_number!}   ${
      payment.invoice_number
    }${presentationDate}0005${importeString}00000${
      payment.fiscal_id_number
    }${registrationCode}${" ".repeat(28)}*\r\n`;
    total_collected += importe!;
  }
  const total_records = formatString(
    "0",
    props.payments.length.toString(),
    7,
    false
  );
  const total_collected_string = formatString(
    "0",
    total_collected.toString(),
    15,
    false
  );
  let footer = `9 ${fileName} ${
    props.EstablishmentNumber
  } 900000    ${presentationDate}${hour}${total_records}${total_collected_string}${" ".repeat(
    36
  )}*`;

  return header + body + footer;
}
