import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";
import { eq, and } from "drizzle-orm";

export const differentialsValuesRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ differentialValueId: z.string() }))
    .query(async ({ input }) => {
      const differentialValue_found =
        await db.query.differentialsValues.findFirst({
          where: eq(schema.differentialsValues.id, input.differentialValueId),
        });
      return differentialValue_found;
    }),
  list: protectedProcedure.query(async () => {
    const differentialValues = await db.query.differentialsValues.findMany();
    return differentialValues;
  }),
  create: protectedProcedure
    .input(
      z.object({
        differentialId: z.string(),
        amount: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const newDifferentialValue = await db
        .insert(schema.differentialsValues)
        .values({
          differentialId: input.differentialId,
          amount: input.amount,
        });
      return newDifferentialValue;
    }),
  change: protectedProcedure
    .input(
      z.object({
        differentialValueId: z.string(),
        differentialId: z.string(),
        amount: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const differentialValue_changed = await db
        .update(schema.differentialsValues)
        .set({ differentialId: input.differentialId, amount: input.amount })
        .where(eq(schema.differentialsValues.id, input.differentialValueId));
      return differentialValue_changed;
    }),
  delete: protectedProcedure
    .input(z.object({ differentialValueId: z.string() }))
    .mutation(async ({ input }) => {
      const differentialValue_deleted = await db
        .delete(schema.differentialsValues)
        .where(eq(schema.differentialsValues.id, input.differentialValueId));
      return differentialValue_deleted;
    }),
});
