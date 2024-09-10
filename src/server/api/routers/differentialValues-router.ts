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

  getByIntegranteId: protectedProcedure
    .input(z.object({ integrantId: z.string() }))
    .query(async ({ input }) => {
      const differentialsValues = await db.query.differentialsValues.findFirst({
        where: eq(schema.differentialsValues.integrant_id, input.integrantId),
      });

      return differentialsValues;
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
        integrant_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const newDifferentialValue = await db
        .insert(schema.differentialsValues)
        .values({
          differentialId: input.differentialId,
          amount: input.amount,
          integrant_id: input.integrant_id,
        });
      return newDifferentialValue;
    }),
  change: protectedProcedure
    .input(
      z.object({
        differentialValueId: z.string(),
        differentialId: z.string(),
        amount: z.number(),
        integrant_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const differentialValue_changed = await db
        .update(schema.differentialsValues)
        .set({
          differentialId: input.differentialId,
          amount: input.amount,
          integrant_id: input.integrant_id,
        })
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
