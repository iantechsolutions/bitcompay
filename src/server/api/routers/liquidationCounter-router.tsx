import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";
import { eq, and } from "drizzle-orm";
import { selectComprobantesSchema } from "~/server/db/schema";

export const liquidations_countersRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ liquidations_counterId: z.string() }))
    .query(async ({ input }) => {
      const liquidations_counter_found =
        await db.query.liquidations_counter.findFirst({
          where: eq(
            schema.liquidations_counter.companies_id,
            input.liquidations_counterId
          ),
        });
      return liquidations_counter_found;
    }),
  create: protectedProcedure
    .input(
      z.object({
        companies_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const new_liquidations_counter = await db
        .insert(schema.liquidations_counter)
        .values({
          companies_id: input.companies_id,
          number: 1,
        });
      return new_liquidations_counter;
    }),
  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        companies_id: z.string(),
        number: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const liquidations_counter_changed = await db
        .update(schema.liquidations_counter)
        .set({
          companies_id: input.companies_id,
          number: input.number,
        })
        .where(eq(schema.liquidations_counter.id, input.id));
      return liquidations_counter_changed;
    }),
  delete: protectedProcedure
    .input(z.object({ liquidations_counterId: z.string() }))
    .mutation(async ({ input }) => {
      const liquidations_counter_deleted = await db
        .delete(schema.liquidations_counter)
        .where(
          eq(schema.liquidations_counter.id, input.liquidations_counterId)
        );
      return liquidations_counter_deleted;
    }),
});
