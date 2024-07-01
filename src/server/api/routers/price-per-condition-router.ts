import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";
import { eq, and } from "drizzle-orm";

export const pricePerConditionRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const pricePerCondition_found =
        await db.query.pricePerCondition.findFirst({
          where: eq(schema.pricePerCondition.id, input.id),
        });
      return pricePerCondition_found;
    }),
  list: protectedProcedure.query(async () => {
    const pricePerConditions = await db.query.pricePerCondition.findMany();
    return pricePerConditions;
  }),
  getByCreatedAt: protectedProcedure
    .input(
      z.object({
        planId: z.string().optional().nullable(),
        createdAt: z.date(),
      })
    )
    .query(async ({ input }) => {
      if (input.planId) {
        const pricePerCondition_found =
          await db.query.pricePerCondition.findMany({
            where: and(eq(schema.pricePerCondition.plan_id, input.planId)),
          });
        const filtered = pricePerCondition_found.filter((price) => {
          return price.validy_date.getTime() == input.createdAt.getTime();
        });
        return filtered;
      }
      return [];
    }),
  create: protectedProcedure
    .input(
      z.object({
        from_age: z.number().optional(),
        to_age: z.number().optional(),
        amount: z.number(),
        plan_id: z.string(),
        isAmountByAge: z.boolean(),
        condition: z.string().optional(),
        validy_date: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      const new_pricePerCondition = await db
        .insert(schema.pricePerCondition)
        .values({
          from_age: input.from_age,
          to_age: input.to_age,
          isAmountByAge: input.isAmountByAge,
          condition: input.condition,
          amount: input.amount,
          plan_id: input.plan_id,
          validy_date: input.validy_date,
        });
      return new_pricePerCondition;
    }),
  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        from_age: z.number().optional(),
        to_age: z.number().optional(),
        amount: z.number(),
        plan_id: z.string(),
        isAmountByAge: z.boolean(),
        condition: z.string().optional(),
        validy_date: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      const pricePerCondition_changed = await db
        .update(schema.pricePerCondition)
        .set({
          from_age: input.from_age,
          to_age: input.to_age,
          isAmountByAge: input.isAmountByAge,
          condition: input.condition,
          amount: input.amount,
          plan_id: input.plan_id,
          validy_date: input.validy_date,
        })
        .where(eq(schema.pricePerCondition.id, input.id));
      return pricePerCondition_changed;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const pricePerCondition_deleted = await db
        .delete(schema.pricePerCondition)
        .where(eq(schema.pricePerCondition.id, input.id));
      return pricePerCondition_deleted;
    }),
});
