import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";
import { eq, and } from "drizzle-orm";

export const liquidationsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const liquidation_found = await db.query.liquidations.findFirst({
        where: eq(schema.liquidations.id, input.id),
      });
      return liquidation_found;
    }),
  list: protectedProcedure.query(async () => {
    const liquidations = await db.query.liquidations.findMany();
    return liquidations;
  }),
  create: protectedProcedure
    .input(
      z.object({
        userCreated: z.string(),
        userApproved: z.string(),
        estado: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const new_liquidation = await db.insert(schema.liquidations).values({
        userCreated: input.userCreated,
        userApproved: input.userApproved,
        estado: input.estado,
      });
      return new_liquidation;
    }),
  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        userCreated: z.string(),
        userApproved: z.string(),
        estado: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const liquidation_changed = await db
        .update(schema.liquidations)
        .set({
          userCreated: input.userCreated,
          userApproved: input.userApproved,
          estado: input.estado,
        })
        .where(eq(schema.liquidations.id, input.id));
      return liquidation_changed;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const liquidation_deleted = await db
        .delete(schema.liquidations)
        .where(eq(schema.liquidations.id, input.id));
      return liquidation_deleted;
    }),
});