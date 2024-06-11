import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";

export const paymentInfoRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const paymentInfo = await db.query.pa.findMany({
      with: {
        integrant: true,
      },
    });
    return paymentInfo;
  }),
  get: protectedProcedure
    .input(
      z.object({
        paymentInfoId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const paymentInfo = await db.query.pa.findFirst({
        where: eq(schema.pa.id, input.paymentInfoId),
      });

      return paymentInfo;
    }),
  getByIntegrant: protectedProcedure
    .input(
      z.object({
        integrantId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const paymentInfo = await db.query.pa.findFirst({
        where: eq(schema.pa.integrant_id, input.integrantId),
      });

      return paymentInfo;
    }),
  create: protectedProcedure
    .input(
      z.object({
        card_number: z.string().nullable().optional(),
        expire_date: z.date().nullable().optional(),
        CCV: z.string().nullable().optional(),
        CBU: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const new_pa = await db.insert(schema.pa).values(input);
      return new_pa;
    }),

  change: protectedProcedure
    .input(
      z.object({
        paymentInfoId: z.string(),
        card_number: z.string().optional().nullable(),
        expire_date: z.date().optional().nullable(),
        CCV: z.string().optional().nullable(),
        CBU: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const updatedPaymentInfo = await db
        .update(schema.pa)
        .set({
          ...input,
        })
        .where(eq(schema.pa.id, input.paymentInfoId));
      return updatedPaymentInfo;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        paymentInfoId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const deletedPaymentInfo = await db
        .delete(schema.pa)
        .where(eq(schema.pa.id, input.paymentInfoId));
      return deletedPaymentInfo;
    }),
});
