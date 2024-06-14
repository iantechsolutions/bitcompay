import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";
import { eq, and } from "drizzle-orm";

export const pricePerAgeRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const pricePerAge_found = await db.query.pricePerAge.findFirst({
        where: eq(schema.pricePerAge.id, input.id),
      });
      return pricePerAge_found;
    }),
  list: protectedProcedure.query(async () => {
    const pricePerAges = await db.query.pricePerAge.findMany();
    return pricePerAges;
  }),
  create: protectedProcedure
    .input(
      z.object({
        age: z.number().optional(),
        amount: z.number(),
        plan_id: z.string(),
        isAmountByAge: z.boolean(),
        condition: z.string().optional(),
        validy_date: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      const new_pricePerAge = await db.insert(schema.pricePerAge).values({
        age: input.age,
        isAmountByAge: input.isAmountByAge,
        condition: input.condition,
        amount: input.amount,
        plan_id: input.plan_id,
        validy_date: input.validy_date,
      });
      return new_pricePerAge;
    }),
  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        age: z.number().optional(),
        amount: z.number(),
        plan_id: z.string(),
        isAmountByAge: z.boolean(),
        condition: z.string().optional(),
        validy_date: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      const pricePerAge_changed = await db
        .update(schema.pricePerAge)
        .set({
          age: input.age,
          isAmountByAge: input.isAmountByAge,
          condition: input.condition,
          amount: input.amount,
          plan_id: input.plan_id,
          validy_date: input.validy_date,
        })
        .where(eq(schema.pricePerAge.id, input.id));
      return pricePerAge_changed;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const pricePerAge_deleted = await db
        .delete(schema.pricePerAge)
        .where(eq(schema.pricePerAge.id, input.id));
      return pricePerAge_deleted;
    }),
});
