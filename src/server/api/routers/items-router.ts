import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";
import { eq, and } from "drizzle-orm";

export const itemsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ input }) => {
      const item_found = await db.query.items.findFirst({
        where: eq(schema.items.id, input.itemId),
      });
      return item_found;
    }),
  list: protectedProcedure.query(async () => {
    const items = await db.query.items.findMany();
    return items;
  }),
  create: protectedProcedure
    .input(
      z.object({
        abono: z.number(),
        differential_amount: z.number(),
        bonificacion: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const new_item = await db.insert(schema.items).values({
        abono: input.abono,
        differential_amount: input.differential_amount,
        bonificacion: input.bonificacion,
      });
      return new_item;
    }),
  change: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        abono: z.number(),
        differential_amount: z.number(),
        bonificacion: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const item_changed = await db
        .update(schema.items)
        .set({
          abono: input.abono,
          differential_amount: input.differential_amount,
          bonificacion: input.bonificacion,
        })
        .where(eq(schema.items.id, input.itemId));
      return item_changed;
    }),
  delete: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ input }) => {
      const item_deleted = await db
        .delete(schema.items)
        .where(eq(schema.items.id, input.itemId));
      return item_deleted;
    }),
});
