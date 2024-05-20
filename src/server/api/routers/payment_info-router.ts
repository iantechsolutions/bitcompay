import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";

export const paymentInfoRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const paymentInfo = await db.query.payment_info.findMany({
      with: {
        payment: true,
      },
    });
    return paymentInfo;
  }),
  get: protectedProcedure
    .input(
      z.object({
        paymentInfoId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const paymentInfo = await db.query.payment_info.findFirst({
        where: eq(schema.payment_info.id, input.paymentInfoId),
      });

      return paymentInfo;
    }),

  create: protectedProcedure
    .input(
      z.object({
        card_number: z.string(),
        expire_date: z.date(),
        CCV: z.string(),
        CBU: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const new_payment_info = await db
        .insert(schema.payment_info)
        .values(input);
      return new_payment_info;
    }),

  change: protectedProcedure
    .input(
      z.object({
        paymentInfoId: z.string(),
        card_number: z.string(),
        expire_date: z.date(),
        CCV: z.string(),
        CBU: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const updatedPaymentInfo = await db
        .update(schema.payment_info)
        .set({
          ...input,
        })
        .where(eq(schema.payment_info.id, input.paymentInfoId));
      return updatedPaymentInfo;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        paymentInfoId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const deletedPaymentInfo = await db
        .delete(schema.payment_info)
        .where(eq(schema.payment_info.id, input.paymentInfoId));
      return deletedPaymentInfo;
    }),
});
