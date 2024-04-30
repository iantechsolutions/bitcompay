import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq, and } from "drizzle-orm";
import dayjs from "dayjs";
import { TRPCError } from "@trpc/server";
import 'dayjs/locale/es';
dayjs.locale('es');

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
              eq(schema.payments.status_code, "91"),
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

      text += `491002513${total_collected_string}${total_operations_string}${total_records_string}${" ".repeat(208)}\r\n`;

      return text;
    }),
});
