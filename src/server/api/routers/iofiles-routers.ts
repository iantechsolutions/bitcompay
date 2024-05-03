import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq, and } from "drizzle-orm";
import dayjs from "dayjs";
import { TRPCError } from "@trpc/server";
import "dayjs/locale/es";
dayjs.locale("es");
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import dayOfYear from "dayjs/plugin/dayOfYear";
import { type RouterOutputs } from "~/trpc/shared";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(dayOfYear);
export const iofilesRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        companyId: z.string(),
        fileName: z.string().max(12),
        concept: z.string(),
        redescription: z.string().max(10),
      }),
    )
    .mutation(async ({ input }) => {
      const channel = await db.query.channels.findFirst({
        where: eq(schema.channels.id, input.channelId),
      });
      let text = " ";
      const productsChannels = await db.query.productChannels.findMany({
        where: eq(schema.productChannels.channelId, input.channelId),
      });
      const transactions = [];
      for (const relation of productsChannels) {
        const product = await db.query.products.findFirst({
          where: eq(schema.products.id, relation.productId),
        });

        if (!product) {
          throw new Error("product or channel does not exist in company");
        }

        const t = await db
          .select()
          .from(schema.payments)
          .where(
            and(
              eq(schema.payments.product_number, product.number),
              eq(schema.payments.companyId, input.companyId),
              eq(schema.payments.status_code, "91"),
            ),
          );

        for (const item of t) {
          transactions.push(item);
        }
      }
      if (channel?.name.includes("DEBITO DIRECTO")) {
        text = await generateDebitoDirecto(input, transactions);
      } else if (channel?.name.includes("PAGOMISCUENTAS")) {
        text = await generatePagomiscuentas(input, transactions);
      } else if (channel?.name.includes("PAGO FACIL")) {
        text = await generatePagoFacil(input, transactions);
      }
      return text;
    }),
});

async function generateDebitoDirecto(
  input: {
    channelId: string;
    companyId: string;
    fileName: string;
    concept: string;
    redescription: string;
  },
  transactions: RouterOutputs["transactions"]["list"],
): Promise<string> {
  let currentDate = dayjs().utc().tz("America/Argentina/Buenos_Aires");
  const currentHour = currentDate.hour();
  const currentMinutes = currentDate.minute();
  if (currentHour > 16 || (currentHour == 16 && currentMinutes > 0)) {
    currentDate = currentDate.add(1, "day");
  }
  const dateYYYYMMDD = currentDate.format("YYYYMMDD");
  const fileName = formatString(" ", input.fileName, 12, true);
  const redDescription = formatString(" ", input.redescription, 10, true);
  let text = `411002513${dateYYYYMMDD}${dateYYYYMMDD}00170356730103179945${redDescription}ARS0${fileName}BITCOM SRL${" ".repeat(
    26,
  )}20${" ".repeat(141)}\r\n`;
  let total_records = 1;
  let total_operations = 0;
  let total_collected = 0;
  for (const transaction of transactions) {
    await db
      .update(schema.payments)
      .set({
        status_code: "92",
      })
      .where(eq(schema.payments.id, transaction.id));

    const date = dayjs(transaction.first_due_date);
    const year = date.year();
    const monthName = date.format("MMMM").toUpperCase();
    const period = formatString(" ", monthName + " " + year, 22, true);
    const dateYYYYMMDD = date.format("YYYYMMDD");
    let collected_amount;
    if (transaction.collected_amount) {
      collected_amount = transaction.collected_amount?.toString();
    } else if (transaction.first_due_amount) {
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
      true,
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
      false,
    );
    const CBU = transaction.cbu;
    text += `421002513  ${fiscalNumber}${CBU}${collectedAmount}00    ${period}${dateYYYYMMDD}  ${invoice_number}${" ".repeat(
      127,
    )}\r\n`;
    let name;
    if (transaction.name!.length > 36) {
      name = transaction.name!.slice(0, 36);
    } else {
      name = formatString(" ", transaction.name!, 36, true);
    }
    text += `422002513  ${fiscalNumber}${name}${" ".repeat(181)}\r\n`;
    text += `423002513  ${fiscalNumber}${" ".repeat(217)}\r\n`;
    const concept = formatString(" ", input.concept, 40, true);
    text += `424002513  ${fiscalNumber}${concept}${" ".repeat(177)}\r\n`;

    total_records += 4;
    total_operations += 1;
    total_collected +=
      transaction.collected_amount ?? transaction.first_due_amount ?? 0;
  }

  total_records += 1;

  const total_collected_string = formatString(
    "0",
    total_collected?.toString(),
    15,
    false,
  );
  const total_operations_string = formatString(
    "0",
    total_operations?.toString(),
    8,
    false,
  );
  const total_records_string = formatString(
    "0",
    total_records?.toString(),
    10,
    false,
  );

  text += `491002513${total_collected_string}${total_operations_string}${total_records_string}${" ".repeat(
    208,
  )}\r\n`;

  return text;
}

async function generatePagomiscuentas(
  input: {
    channelId: string;
    companyId: string;
    fileName: string;
    concept: string;
    redescription: string;
  },
  transactions: RouterOutputs["transactions"]["list"],
): Promise<string> {
  const dateAAAAMMDD = dayjs().format("YYYYMMDD");
  const companyCode = "1234";
  //header
  let text = `0400${companyCode}${dateAAAAMMDD}${"0".repeat(84)}\n`;
  let total_records = 0;
  let total_collected = 0;
  for (const transaction of transactions) {
    // registro
    const fiscal_id_number = formatString(
      " ",
      transaction.fiscal_id_number!.toString(),
      19,
      true,
    );
    const invoice_number = formatString(
      " ",
      transaction.invoice_number.toString(),
      20,
      true,
    );
    const first_due_date = dayjs(transaction.first_due_date).format("YYYYMMDD");
    const first_due_amount = formatString(
      "0",
      transaction.first_due_amount
        ? transaction.first_due_amount?.toString()
        : "",
      9,
      false,
    );
    const controlNumber = "1292";
    // const concept = formatString(" ", input.concept, 40, true);
    // const displayMessage = formatString(" ", input.concept, 15, true);
    text += `5${fiscal_id_number}${invoice_number}${first_due_date}0${first_due_date}${first_due_amount}00`;
    text += `2${dateAAAAMMDD}PC${controlNumber}   ${"0".repeat(14)}\n`;
    total_records++;
    total_collected += transaction.first_due_amount!;
  }
  // trailer
  const total_collected_string = formatString(
    "0",
    total_collected.toString(),
    9,
    false,
  );
  const total_records_string = formatString(
    "0",
    total_records.toString(),
    7,
    false,
  );
  text += `9400${companyCode}${dateAAAAMMDD}${total_records_string}${"0".repeat(
    7,
  )}${total_collected_string}00${"0".repeat(11)}${"0".repeat(48)}\n`;

  return text;
}

async function generatePagoFacil(
  input: {
    channelId: string;
    companyId: string;
    fileName: string;
    concept: string;
    redescription: string;
  },
  transactions: RouterOutputs["transactions"]["list"],
): Promise<string> {
  let text = "";
  //header
  const date = dayjs().format("DDMMYYYY");
  const hours = dayjs().format("HHmmss");
  const companyName = formatString(" ", "BITCOM SRL", 40, true);
  const originName = formatString(" ", "PAGO FACIL", 10, true);
  text += `1${date}90063509${companyName}${originName}${"0".repeat(123)}\r\n`;
  let total_records = 0;
  let total_collected = 0;
  for (const transaction of transactions) {
    const fiscal_id_number = formatString(
      " ",
      transaction.fiscal_id_number!.toString(),
      11,
      true,
    );
    const invoice_number = formatString(
      "0",
      transaction.invoice_number.toString(),
      6,
      false,
    );
    const first_due_date = dayjs(transaction.first_due_date).format("DDMMYYYY");
    const first_due_amount = formatString(
      "0",
      transaction.first_due_amount
        ? transaction.first_due_amount?.toString()
        : "",
      10,
      false,
    );
    const CBU = transaction.cbu;
    const terminal_id = "123456";
    const seq_terminal = "1234";
    // codigo de barras
    const service_company = "3509";
    const dayOfYear = dayjs(transaction.first_due_date).dayOfYear();
    const first_due_amount_bar_code = formatString(
      "0",
      transaction.first_due_amount!.toString(),
      6,
      false,
    );
    const first_due_date_bar_code = first_due_date.slice(-2) + dayOfYear;
    const second_due_amount_charge = "000330";
    const bar_code = `${service_company}${first_due_amount_bar_code}00${first_due_date_bar_code}${fiscal_id_number}0${second_due_amount_charge}${first_due_date.slice(
      2,
    )}00`;
    //fin codigo de barras
    text += `3${date}${"0".repeat(6)}${invoice_number}10${formatString(
      " ",
      bar_code,
      60,
      true,
    )}${fiscal_id_number}PES${first_due_amount}00${terminal_id}${date}${hours}${seq_terminal} PESE${" ".repeat(
      29,
    )}${formatString(
      "0",
      transaction.first_due_amount
        ? transaction.first_due_amount?.toString()
        : "",
      13,
      false,
    )}00\r\n`;
    total_records++;
    total_collected += transaction.first_due_amount!;
  }
  const total_records_string = formatString(
    "0",
    total_records.toString(),
    7,
    false,
  );
  const total_collected_string = formatString(
    "0",
    total_collected.toString(),
    12,
    false,
  );
  text += `9${"0".repeat(8)}${"0".repeat(12)}${"0".repeat(
    7,
  )}${total_records_string}${total_collected_string}${"0".repeat(143)}`;
  return text;
}

function formatString(
  char: string,
  string: string,
  limit: number,
  final: boolean,
) {
  if (final) {
    return string.concat(char.repeat(limit - string.length));
  } else {
    return char.repeat(limit - string.length).concat(string);
  }
}

function verificationNumber(string: string) {}
