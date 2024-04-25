import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq, and } from "drizzle-orm";
import dayjs from "dayjs";
import { TRPCError } from "@trpc/server";

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
      const company = await db.query.companies.findFirst({
        where: eq(schema.companies.id, input.companyId),
      });

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

        // const t = await db.query.payments.findMany({
        //   where: eq(schema.payments.product_number, product.number),
        // });

        const t = await db
          .select()
          .from(schema.payments)
          .where(
            and(
              eq(schema.payments.product_number, product.number),
              eq(schema.payments.companyId, input.companyId),
            ),
          );

        for (const item of t) {
          transactions.push(item);
        }
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
      let currentDate = dayjs();
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
        //actulizar estado de pago
        await db
          .update(schema.payments)
          .set({
            status_code: "92",
          })
          .where(eq(schema.payments.id, transaction.id));

        //deserializacion de archivo
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
        const collectedAmount = formatString("0", collected_amount, 13, false);
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
        text += `421002513  ${fiscalNumber}${CBU}${collectedAmount}00      ${period}${dateYYYYMMDD}  ${invoice_number}${" ".repeat(
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
        13,
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

      text += `491002513${total_collected_string}${total_operations_string}${total_records_string}\r\n`;

      return text;
    }),
});

// 411002513202303292023033000170356730103179945MEPLIFE   ARS0Com.Rur.CuotBITCOM SRL                          20
// 421002513  20174324736           2850600140001011366187000000000085000      ABRIL 2023            20230403  000000000133400
// 422002513  20174324736           BURELA HUGO ANTONIO
// 423002513  20174324736
// 424002513  20174324736           ARANCEL MEPLIFE SALUD SRL
// 421002513  20358116125           2850600140001035864973000000000085000      ABRIL 2023            20230403  000000000133401
// 422002513  20358116125           CABEZA NICOLAS CARLOS MIGUEL
// 423002513  20358116125
// 424002513  20358116125           ARANCEL MEPLIFE SALUD SRL
// 421002513  20272585149           2850600140001032120155000000000085000      ABRIL 2023            20230403  000000000133402
// 422002513  20272585149           CARRION PABLO ISAAC
// 423002513  20272585149
// 424002513  20272585149           ARANCEL MEPLIFE SALUD SRL
// 421002513  20336325626           2850600140080079047250000000000085000      ABRIL 2023            20230403  000000000133403
// 422002513  20336325626           COLQUE VICTOR SEBASTIAN
// 423002513  20336325626
// 424002513  20336325626           ARANCEL MEPLIFE SALUD SRL
// 421002513  20230691232           2850600140080079881764000000000085000      ABRIL 2023            20230403  000000000133404
// 422002513  20230691232           CUELLO DANIEL ALEJANDRO
// 423002513  20230691232
// 424002513  20230691232           ARANCEL MEPLIFE SALUD SRL
// 421002513  20331657493           2850600140001011220591000000000085000      ABRIL 2023            20230403  000000000133405
// 422002513  20331657493           GOMEZ ADRIAN ENRIQUE
// 423002513  20331657493
// 424002513  20331657493           ARANCEL MEPLIFE SALUD SRL
// 421002513  27289561868           2850600140001026721023000000000085000      ABRIL 2023            20230403  000000000133406
// 422002513  27289561868           HERRERA SILVIA NOEMI
// 423002513  27289561868
// 424002513  27289561868           ARANCEL MEPLIFE SALUD SRL
// 421002513  23179165554           2850600140080077091914000000000085000      ABRIL 2023            20230403  000000000133407
// 422002513  23179165554           JIMENEZ FATIMA FRANCISCA
// 423002513  23179165554
// 424002513  23179165554           ARANCEL MEPLIFE SALUD SRL
// 421002513  27240061614           2850600140001018798705000000000085000      ABRIL 2023            20230403  000000000133408
// 422002513  27240061614           JIMENEZ ROXANA DEL VALLE
// 423002513  27240061614
// 424002513  27240061614           ARANCEL MEPLIFE SALUD SRL
// 421002513  27166939513           2850600140001010254887000000000085000      ABRIL 2023            20230403  000000000133409
// 422002513  27166939513           LUNA MERCEDES ANDREA
// 423002513  27166939513
// 424002513  27166939513           ARANCEL MEPLIFE SALUD SRL
// 421002513  20379971491           2850628540095399630918000000000085000      ABRIL 2023            20230403  000000000133410
// 422002513  20379971491           MADRID RODRIGO EMANUEL
// 423002513  20379971491
// 424002513  20379971491           ARANCEL MEPLIFE SALUD SRL
// 421002513  27355496274           2850600140001011875005000000000085000      ABRIL 2023            20230403  000000000133411
// 422002513  27355496274           QUIROGA YANINA RAMONA
// 423002513  27355496274
// 424002513  27355496274           ARANCEL MEPLIFE SALUD SRL
// 421002513  20114212866           2850600140080077105778000000000085000      ABRIL 2023            20230403  000000000133412
// 422002513  20114212866           RUIZ RAUL RUVEN
// 423002513  20114212866
// 424002513  20114212866           ARANCEL MEPLIFE SALUD SRL
// 421002513  23336093139           2850600140080079274814000000000085000      ABRIL 2023            20230403  000000000133413
// 422002513  23336093139           SANDEZ JOSE ALEJANDRO
// 423002513  23336093139
// 424002513  23336093139           ARANCEL MEPLIFE SALUD SRL
// 421002513  20168864273           2850600140080077091846000000000085000      ABRIL 2023            20230403  000000000133414
// 422002513  20168864273           YUBRIN JOSE RODOLFO
// 423002513  20168864273
// 424002513  20168864273           ARANCEL MEPLIFE SALUD SRL
// 491002513000000001275000000000150000000062
