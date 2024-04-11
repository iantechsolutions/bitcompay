import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import dayjs from "dayjs";
import { TRPCError } from "@trpc/server";
import { error } from "console";

export const iofilesRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        companyName: z.string(),
        fileName: z.string(),
        concept: z.string(),
      }),
    )
    .mutation(async ({input}) => {
      const productsChannels = await db.query.productChannels.findMany({
        where: eq(schema.productChannels.channelId, input.channelId),
      });

      const transactions = [];
      for (const relation of productsChannels) {

        const product= await db.query.products.findFirst({
          
          where:eq (schema.products.id, relation.productId)
        });

        if(!product){
          throw new Error("product or channel does not exist in company")
        }

        const t = await db.query.payments.findMany({
          where: eq(schema.payments.product_number, product.number),
        });
        for (const item of t) {
          transactions.push(item);
        }
      }

      const currentDate = dayjs();
      const dateYYYYMMDD = currentDate.format("YYYYMMDD");
      let text = `411002513${dateYYYYMMDD}${dateYYYYMMDD} 00170356730103179945${input.companyName}   ${input.fileName}BITCOM SRL                          20                        \r\n`;
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
        const dateYYYYMMDD = date.format("YYYYMMDD");
        let CBU = "0000000000000000000000";
        if (transaction.cbu && transaction.cbu !== " ") {
          CBU = transaction.cbu;
        }
        let zeros_collected_amount = "0000000000000";
        const collected_amount_digits =
          transaction.collected_amount?.toString().length ?? 0;
        if (collected_amount_digits < 13) {
          zeros_collected_amount = "0".repeat(13 - collected_amount_digits);
        }

        text += `421002513  ${
          transaction.fiscal_id_number
        }           ${CBU}${zeros_collected_amount}${
          transaction.collected_amount ?? ""
        }00                              ${monthName} ${year}         ${dateYYYYMMDD}  000000000${
          transaction.invoice_number
        }                        \r\n`;
        text += `422002513  ${transaction.fiscal_id_number}           ${transaction.name}                        \r\n`;
        text += `423002513  ${transaction.fiscal_id_number}                         \r\n`;
        text += `424002513  ${transaction.fiscal_id_number}           ${input.concept}                        \r\n`;

        total_records += 4;
        total_operations += 1;
        total_collected += transaction.collected_amount ?? 0;
      }

      total_records += 1;

      const total_records_string = total_records?.toString();
      const total_operations_string = total_operations?.toString();
      const total_collected_string = total_collected?.toString();
      let zeros_total_income = "";
      let zeros_total_operations = "";
      let zeros_total_collected = "";
      if (total_records_string?.length < 8) {
        zeros_total_income = "0".repeat(13 - total_records_string.length);
      }

      if (total_operations_string.length < 10) {
        zeros_total_operations = "0".repeat(
          10 - total_operations_string.length,
        );
      }

      if (total_collected_string.length < 13) {
        zeros_total_collected = "0".repeat(13 - total_collected_string.length);
      }

      text += `491002513${zeros_total_collected}${total_collected}${zeros_total_operations}${total_operations}${zeros_total_income}${total_records}\r\n`;

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
