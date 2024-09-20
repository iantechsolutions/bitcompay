import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { and, eq, inArray, isNull, desc, not } from "drizzle-orm";
import { z } from "zod";
import { type DBTX, db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { createId } from "~/lib/utils";
import { utapi } from "~/server/uploadthing";
import type { RouterOutputs } from "~/trpc/shared";
import { Payment, payments } from "~/server/db/schema";
import { Barcode, Repeat } from "lucide-react";
import dayOfYear from "dayjs/plugin/dayOfYear";
import timezone from "dayjs/plugin/timezone";
import { Console } from "console";
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
        // presentation_date: z.date().nullable().optional(),
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
          where: eq(schema.paymentStatus.code, "91"),
        });
        const statusCancelado = await db.query.paymentStatus.findFirst({
          where: eq(schema.paymentStatus.code, "90"),
        });

        const statusEnviado = await db.query.paymentStatus.findFirst({
          where: eq(schema.paymentStatus.code, "92"),
        });

        const paymentsFull = await db.query.payments.findMany({
          where: and(
            eq(schema.payments.companyId, input.companyId),
            eq(schema.payments.g_c, brand.number),
            inArray(schema.payments.product_number, productsNumbers)
          ),
        });

        let payments = paymentsFull.filter(
          (p) =>
            p.genChannels.includes(channel.id) === false &&
            p.statusId !== statusCancelado?.id &&
            p.statusId !== statusEnviado?.id
        );

        let card_brand = input?.card_brand?.toUpperCase();
        let card_type = input?.card_type?.toUpperCase();
        console.log(card_brand, card_type, "acal");
        console.log("patata", payments);

        if (
          channel.name.includes("DEBITO AUTOMATICO") &&
          card_brand &&
          card_type
        ) {
          payments = payments.filter(
            (p) =>
              p.card_brand?.toUpperCase().includes(card_brand) &&
              p.card_type?.toUpperCase().includes(card_type)
          );
        }

        console.log("Algo ahi");

        const regexPagoFacil = /pago\s*f[aá]cil/i;
        // Generamos el archivo de salida segun el canal
        console.log("patatas", payments.length, payments);
        if (payments.length === 0) {
          text = "No existen payments disponibles";
        } else if (channel.name.includes("DEBITO DIRECTO CBU")) {
          const generateInput = {
            channelId: channel.id,
            companyId: companyId!,
            fileName: input.fileName!,
            concept: input.concept,
            redescription: brand.redescription,
            brand_name: brand.name,
          };
          text = generateDebitoDirecto(generateInput, payments);
        } else if (channel.name.includes("PAGOMISCUENTAS")) {
          const generateInput = {
            channelId: channel.id,
            companyId: companyId!,
            fileName: input.fileName!,
            concept: input.concept,
            redescription: brand.redescription,
            brand_name: brand.name,
          };
          text = generatePagomiscuentas(
            generateInput,
            brand.name,
            brand.prisma_code ?? "",
            payments
          );
        } else if (channel.name.match(regexPagoFacil)) {
          const generateInput = {
            channelId: channel.id,
            companyId: companyId!,
            fileName: input.fileName!,
            concept: input.concept,
            brandName: brand.name,
            redescription: brand.redescription,
            utility: brand.utility,
          };
          text = await generatePagoFacil(generateInput, payments);
        } else if (channel.name.includes("RAPIPAGO")) {
          const generateInput = {
            channelId: channel.id,
            companyId: companyId!,
            fileName: input.fileName!,
            concept: input.concept,
            brandName: brand.name,
            redescription: brand.redescription,
            prisma_code: brand.prisma_code,
          };
          text = generateRapiPago(generateInput, payments);
        } else if (channel.name.includes("DEBITO AUTOMATICO")) {
          if (
            !card_brand ||
            !card_type
            //|| !input.presentation_date
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `card_brand, card_type and presentation_date are required for DEBITO AUTOMATICO`,
            });
          }

          const establishment = await db.query.establishments.findFirst({
            where: and(
              eq(schema.establishments.brandId, brand.id),
              eq(schema.establishments.flag, card_brand)
            ),
          });

          if (!establishment) {
            return null;
          }

          text = generateDebitoAutomatico({
            payments,
            EstablishmentNumber: establishment.establishment_number ?? 0,
            cardType: card_type,
            flag: card_brand,
            // presentationDate: input.presentation_date,
          });
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `channel ${channel?.name} is not supported`,
          });
        }
        if (text.includes("Error. La marca no posee codigo de prisma")) {
          return text;
        } else if (text.includes("Error. Hay pagos sin un CBU asociado.")) {
          return text;
        } else if (text.includes("Error. La marca no posee utility code")) {
          return text;
        } else if (text.includes("Error. Utility code incorrecto")) {
          return text;
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
            where: eq(schema.products.number, payment.product_number!),
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
                // update statuses
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
                    statusId: statusEnviado?.id,
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
    brand_name: string;
  },
  transactions: RouterOutputs["transactions"]["list"]
) {
  let register_code = "4110";
  let brand_code = "02513";

  let currentDate = dayjs().utc().tz("America/Argentina/Buenos_Aires");
  const currentHour = currentDate.hour();
  const currentMinutes = currentDate.minute();
  if (currentHour > 16 || (currentHour === 16 && currentMinutes > 0)) {
    currentDate = currentDate.add(1, "day");
  }
  const dateYYYYMMDD = currentDate.format("YYYYMMDD");

  console.log("Hoy algo ahi 2");

  let banco_emisor = "0017";
  let sucursal_number = "0356";
  let account_digit = "73";
  let account_number = "0103179945";
  let divisa = "ARS0";

  const fileName = formatString(" ", input.fileName, 12, true);
  const service_code = formatString(" ", input.redescription, 10, true);

  let brand_name = formatString(" ", input.brand_name, 36, true);
  let account_type = "20";
  let text = `${register_code}${brand_code}${dateYYYYMMDD}${dateYYYYMMDD}${banco_emisor}${sucursal_number}${account_digit}${account_number}${service_code}${divisa}${fileName}${brand_name}${account_type}${" ".repeat(
    141
  )}\r\n`;

  let total_records = 1;
  let total_operations = 0;
  let total_collected = 0;
  for (const transaction of transactions) {
    if (!transaction.cbu && transaction?.cbu?.length === 0) {
      text += "Error. Hay pagos sin un CBU asociado.";
      return text;
    }

    const date = dayjs(transaction.first_due_date);
    const year = date.year();
    const monthName = date.format("MMMM").toUpperCase();
    const period = formatString(" ", `${monthName} ${year}`, 22, true);
    const dateYYYYMMDD = date.format("YYYYMMDD");

    const collectedAmount = formatAmount(
      transaction.collected_amount! ?? transaction.first_due_amount!,
      13
    );
    if (!collectedAmount) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: ` no hay informacion sobre importe a cobrar (invoice number:${transaction.invoice_number}`,
      });
    }

    const fiscalNumber = formatString(
      " ",
      transaction.affiliate_number!.toString(),
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
    let CBU = "0".repeat(22);
    if (transaction.cbu.length === 22) {
      CBU = transaction.cbu;
    }
    text += `421002513  ${fiscalNumber}${CBU}${collectedAmount}      ${period}${dateYYYYMMDD}  ${invoice_number}${" ".repeat(
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

  const total_collected_string = formatAmount(total_collected, 13);
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
  prismaCode: string,
  transactions: RouterOutputs["transactions"]["list"]
) {
  const dateAAAAMMDD = dayjs().locale("es").format("YYYYMMDD");

  // codeCompanyMap[brandName.toLowerCase() as keyof typeof codeCompanyMap];

  // if (!companyCode) {
  //   throw new TRPCError({
  //     code: "BAD_REQUEST",
  //     message: `company code not found in this brand`,
  //   });
  // }
  //header
  console.log("prismaCode", prismaCode);
  if (prismaCode.length != 4) {
    prismaCode = "EROR";
    return "Error. La marca no posee codigo de prisma";
  }

  let register_code = "0";
  let prisma_code = "400";
  let text = `${register_code}${prisma_code}${prismaCode}${dateAAAAMMDD}${"0".repeat(
    264
  )}\n`;
  let total_collected = 0;
  for (const transaction of transactions) {
    // registro

    let register_code = "5";

    const affiliate_number = formatString(
      " ",
      transaction.affiliate_number!.toString(),
      19,
      true
    );
    const invoice_number = formatString(
      " ",
      transaction.invoice_number.toString(),
      20,
      true
    );

    let moneda = "0";

    const first_due_date = dayjs(transaction.first_due_date).format("YYYYMMDD");
    const first_due_amount = formatAmount(transaction.first_due_amount!, 9);

    let second_due_amount;
    if (transaction.second_due_amount) {
      second_due_amount = formatAmount(transaction.second_due_amount, 9);
    } else {
      second_due_amount = "0".repeat(11);
    }
    const second_due_date = dayjs(
      transaction.second_due_date
        ? transaction.second_due_date
        : transaction.first_due_date
    ).format("YYYYMMDD");

    let third_due_amount = "0".repeat(19);
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
        .format("MMYYYY")}`,
      9,
      true
    );

    let barcode = "0".repeat(60);
    let filler2 = "0".repeat(29);
    let filler = "0".repeat(19);

    text += `${register_code}${affiliate_number.toUpperCase()}${invoice_number}${moneda}${first_due_date}${first_due_amount}${second_due_date}${second_due_amount}${third_due_amount}${filler}${affiliate_number.toUpperCase()}${ticketMessage}ABONO ${displayMessage.toUpperCase()}${barcode}${filler2}\n`;

    total_collected += transaction.first_due_amount!;
  }
  // trailer
  const total_collected_string = formatAmount(total_collected, 14);
  const total_records_string = formatString(
    "0",
    transactions.length.toString(),
    7,
    false
  );

  text += `${register_code}${prisma_code}${prismaCode}${dateAAAAMMDD}${total_records_string}${"0".repeat(
    7
  )}${total_collected_string}${"0".repeat(234)}\n`;

  return text;
}

async function generatePagoFacil(
  _input: {
    channelId: string;
    companyId: string;
    fileName: string;
    concept: string;
    brandName: string;
    redescription: string;
    utility: string | null;
  },
  transactions: RouterOutputs["transactions"]["list"]
): Promise<string> {
  let text = "";

  if (!_input.utility) {
    text = "Error. La marca no posee utility code";
    return text;
  }
  if (_input.utility?.length != 8) {
    text = "Error. Utility code incorrecto";
    return text;
  }
  let brandType = "000";
  if (_input.brandName.toUpperCase() === "RED ARGENTINA DE SANATORIOS") {
    brandType = "002";
  }
  if (_input.brandName.toUpperCase() === "CRISTAL SALUD") {
    brandType = "003";
  }
  let registeR_type = "01";
  const records_number = formatString(
    "0",
    transactions.length.toString(),
    9,
    false
  );
  let action = "A";
  let utility = formatString(" ", _input.utility, 8, true);

  const todayDate = dayjs().format("YYYYMMDD");
  // const date = dayjs().format("DDMMYYYY");
  // const hours = dayjs().format("HHmmss");
  // const companyName = formatString(" ", "BITCOM SRL", 40, true);
  // const originName = formatString(" ", "PAGO FACIL", 10, true);

  text += `${registeR_type}${records_number}${action}${utility}${todayDate}${" ".repeat(
    172
  )}\r\n`;

  let total_records = 0;
  let total_collected = 0;

  for (const transaction of transactions) {
    let register_type = "02";
    let brandCode = utility.slice(4, 8);
    console.log("testatario", brandCode, utility);
    // if (_input.brandName === "RED ARGENTINA DE SANATORIOS") {
    //   brandCode = "002";
    // } else if (_input.brandName === "Cristal Salud") {
    //   brandCode = "002";
    // } else {
    //   brandCode = "000";
    // }

    const fiscal_id_number = formatString(
      " ",
      transaction.affiliate_number ?? "",
      30,
      true
    );
    const invoice_number = formatString(
      "0",
      transaction.invoice_number.toString(),
      18,
      false
    );
    const seq_number = `${dayjs(transaction.first_due_date).year()}01`;
    console.log("testos", seq_number);
    const message = formatString(
      " ",
      transaction.additional_info ?? "",
      20,
      true
    );
    const name = formatString(" ", transaction.name ?? " ", 40, true);
    const first_due_date = dayjs(transaction.first_due_date).format("YYYYMMDD");
    const first_codebar = dayjs(transaction.first_due_date).format("DD");

    const second_due_date = first_due_date;
    const validity_date = dayjs(transaction.period).format("YYYYMMDD");

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
    const payment_time = dayjs(transaction.first_due_date).format("HHmmss");
    // codigo de barras
    const service_company = _input.utility;
    const dayOfYear = dayjs(transaction.first_due_date).dayOfYear();
    const first_due_date_bar_code_YY = dayjs(transaction.first_due_date).format(
      "YY"
    );
    const first_due_date_bar_code_DDD = dayjs(transaction.first_due_date)
      .dayOfYear()
      .toString()
      .padStart(3, "0");

    const fiscal_id_number_bar_code = formatString(
      "0",
      transaction.affiliate_number!.toString(),
      14,
      false
    );

    const first_due_amount_bar_code = formatAmount(
      transaction.first_due_amount!,
      6
    );
    console.log(
      "testeos",
      brandType,
      "+",
      invoice_number,
      "+",
      fiscal_id_number,
      "   ",
      transaction.affiliate_number
    );

    let payment_type = "T";
    let moneda = "0";
    const second_due_amount_charge = "0".repeat(6);
    const second_due_date_barcode = "0".repeat(2);
    // codigo de barras
    const bar_code = `${brandCode}${first_due_amount_bar_code}${first_due_date_bar_code_YY}${first_due_date_bar_code_DDD}${fiscal_id_number_bar_code}${moneda}${second_due_amount_charge}${second_due_date_barcode}`;

    const { verifier_digit_1, verifier_digit_2, updated_bar_code } =
      generateVerifiers(bar_code);

    console.log("verifier_digit_1", verifier_digit_1);
    console.log("verifier_digit_2", verifier_digit_2);
    console.log("updated_bar_code", updated_bar_code);
    const barcode = formatString(" ", updated_bar_code, 55, true);

    text += `${register_type}${brandType}${invoice_number}${fiscal_id_number}${seq_number}${message}${name}${barcode}${validity_date}${first_due_date}${payment_type}${" ".repeat(
      9
    )}\r\n`;
    // detalle;
    total_records++;
    total_collected += transaction.first_due_amount!;
  }
  let triller_register = "9";
  const total_records_string = formatString(
    "0",
    total_records.toString(),
    7,
    false
  );
  const total_collected_string = formatAmount(total_collected!, 10);
  // text += `${triller_register}${"0".repeat(8)}${"0".repeat(12)}${"0".repeat(
  //   7
  // )}${total_records_string}${total_collected_string}${"0".repeat(143)}`;
  return text;
}
function generateRapiPago(
  _input: {
    channelId: string;
    companyId: string;
    fileName: string;
    concept: string;
    redescription: string;
    prisma_code: string | null;
  },
  transactions: RouterOutputs["transactions"]["list"]
) {
  const currentDate = dayjs().format("YYYYMMDD");
  let register_type = "0";
  let rapipago_code = "814";

  let text = `${register_type}${rapipago_code}${"0".repeat(
    2
  )}${currentDate}${"0".repeat(76)}\n`;
  // let text = `${"0".repeat(8)}BITCOM SRL${" ".repeat(
  //   10
  // )}${currentDate}Cobranzas Rapipago${" ".repeat(19)}\n`;
  let total_records = 0;
  let total_collected = 0;

  for (const transaction of transactions) {
    let register_type = "5";
    const fiscal_id_number = formatString(
      "0",
      transaction.affiliate_number!.toString(),
      19,
      false
    );
    const invoice_number = formatString(
      "0",
      transaction.invoice_number.toString(),
      20,
      false
    );
    let moneda = "0";
    const first_due_date = dayjs(transaction.first_due_date).format("YYYYMMDD");

    const first_due_amount_test = formatAmount(
      transaction.first_due_amount!,
      9
    );
    let second_due_amount;
    if (transaction.second_due_amount) {
      second_due_amount = formatAmount(transaction.second_due_amount, 9);
    } else {
      second_due_amount = "0".repeat(11);
    }
    const second_due_date = dayjs(
      transaction.second_due_date
        ? transaction.second_due_date
        : transaction.first_due_date
    ).format("YYYYMMDD");

    text += `${register_type}${fiscal_id_number}${invoice_number}${moneda}${first_due_date}${first_due_amount_test}${second_due_date}${second_due_amount}${"0".repeat(
      11
    )}\n`;
    // text += `${currentDate}${" ".repeat(
    //   15
    // )}${fiscal_id_number}${invoice_number}0${first_due_date}${first_due_amount_test}${first_due_date}${first_due_amount_test}${"0".repeat(
    //   5
    // )}\n`;
    total_records++;
    total_collected += transaction.first_due_amount ?? 0;
  }
  let type_register = "9";
  const total_records_string = formatString(
    "0",
    total_records.toString(),
    7,
    false
  );
  let dollarRecords = "0".repeat(7);
  let dollarAmount = "0".repeat(11);

  const total_collected_string_test = formatAmount(total_collected, 9);
  text += `${type_register}${rapipago_code}00${currentDate}${total_records_string}${dollarRecords}${total_collected_string_test}${dollarAmount}${"0".repeat(
    40
  )}`;
  // text += `${"9".repeat(
  //   8
  // )}${total_records_string}${total_collected_string_test}${" ".repeat(39)}`;
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
  if (string.length === limit) {
    return string;
  }
  if (final) {
    return string.concat(char.repeat(limit - string.length));
  }
  return char.repeat(limit - string.length).concat(string);
}

function formatAmount(number: number, limit: number) {
  console.log("el numero", number);
  let numString = number.toString();

  if (numString.includes(".")) {
    let punto = numString.indexOf(".");
    numString = numString.slice(0, punto + 2);

    numString = numString.replace(".", "");
    numString = numString + "0";

    while (numString.length < limit + 2) {
      numString = "0" + numString;
    }
    console.log(numString, "revisar");
    return numString;
  } else {
    while (numString.length < limit) {
      numString = "0" + numString;
    }

    console.log(numString);
    return numString + "00";
  }
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
  // presentationDate: Date;
  EstablishmentNumber: number;
  cardType: string;
  flag: string;
};
function generateDebitoAutomatico(props: generateDAprops) {
  const FileNameMap: Record<string, string> = {
    "VISA CREDITO": "DEBLIQC ",
    "VISA DEBITO": "DEBLIQD ",
    "MASTERCARD CREDITO": "DEBLIMC ",
  };

  let currentDate = dayjs().utc().tz("America/Argentina/Buenos_Aires");
  const currentHour = currentDate.hour();
  const currentMinutes = currentDate.minute();
  if (currentHour > 16 || (currentHour === 16 && currentMinutes > 0)) {
    currentDate = currentDate.add(1, "day");
  }
  const dateYYYYMMDD = currentDate.format("YYYYMMDD");

  let key = `${props.flag.toUpperCase()} ${props.cardType.toUpperCase()}`;
  console.log("testamento", props.flag, props.cardType, key);
  const fileName = FileNameMap[key] || " ".repeat(8);

  const establishmentNumber = formatString(
    "0",
    props.EstablishmentNumber.toString(),
    10,
    false
  );

  // const presentationDate = dayjs(props.presentationDate).format("YYYYMMDD");
  const hour = dayjs().format("HHmm");
  let header = `0${fileName}${establishmentNumber}900000    ${dateYYYYMMDD}${hour}0  ${" ".repeat(
    55
  )}*\r\n`;

  let body = "";
  let total_collected = 0;
  for (const payment of props.payments) {
    const invoice_number = formatString(
      "0",
      payment.invoice_number.toString(),
      8,
      false
    );

    const importe = payment.collected_amount ?? payment.first_due_amount;
    const importeString = formatAmount(importe!, 13);

    const registrationCode = payment.is_new ? "E" : " ";
    body += `1${
      payment.card_number || " ".repeat(16)
    }   ${invoice_number}${dateYYYYMMDD}0005${importeString}${"0".repeat(4)}${
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
  const establishment = formatString(
    "0",
    props.EstablishmentNumber.toString(),
    10,
    false
  );
  const total_collected_string = formatAmount(total_collected, 13);
  let footer = `9${fileName}${establishment}900000    ${dateYYYYMMDD}${hour}${total_records}${total_collected_string}${" ".repeat(
    36
  )}*`;

  return header + body + footer;
}

function modulo11Verifier(code: string): string {
  let numericCode = code.replace(/\D/g, "");

  let sequence = [];
  let pattern = [1, 3, 5, 7, 9];

  if (numericCode) {
    for (let i = 0; i < numericCode.length; i++) {
      sequence.push(pattern[i % pattern.length] ?? 0);
    }

    let sum = 0;

    for (let i = 0; i < numericCode.length; i++) {
      sum += parseInt(numericCode[i] ?? "0") * (sequence[i] ?? 0);
    }

    let resultDiv2 = Math.floor(sum / 2);

    let verifier = resultDiv2 % 10;

    return verifier.toString();
  }

  return "0";
}

function generateVerifiers(bar_code: string) {
  let verifier_digit_1 = modulo11Verifier(bar_code) ?? "0";

  let updated_bar_code = bar_code + verifier_digit_1;

  let verifier_digit_2 = modulo11Verifier(updated_bar_code);
  updated_bar_code = updated_bar_code + verifier_digit_2;
  return {
    verifier_digit_1,
    verifier_digit_2,
    updated_bar_code,
  };
}

// Función para generar la secuencia alternante 1, 3, 5, 7, 9

// function modulo11Verifier(code: string) {
//   let sum = 0;
//   let weight = 2;

//   const numericCode = code.replace(/\D/g, "0"); // Filtramos solo los caracteres numéricos

//   for (let i = numericCode.length - 1; i >= 0; i--) {
//     sum += parseInt(numericCode[i]!) * weight;
//     weight = weight === 7 ? 2 : weight + 1;
//   }

//   const remainder = sum % 11;
//   let verifierDigit = 11 - remainder;

//   if (verifierDigit >= 10) {
//     return verifierDigit.toString().padStart(2, "0");
//   } else {
//     return "0" + verifierDigit;
//   }
// }
