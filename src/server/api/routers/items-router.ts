import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";
import { eq, and } from "drizzle-orm";
import { selectComprobantesSchema } from "~/server/db/schema";

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
        concept: z.string(),
        amount: z.number(),
        iva: z.number(),
        total: z.number(),
        abono: z.number().optional(),
        comprobante_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const new_item = await db.insert(schema.items).values({
        iva: input.iva,
        concept: input.concept,
        amount: input.amount,
        total: input.total,
        abono: input.abono,
        comprobante_id: input.comprobante_id,
      });
      return new_item;
    }),
  createReturnComprobante: protectedProcedure
    .input(
      z.object({
        concept: z.string(),
        amount: z.number(),
        iva: z.number(),
        total: z.number(),
        abono: z.number(),
        comprobante_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const new_item = await db.insert(schema.items).values({
        iva: input.iva,
        concept: input.concept,
        amount: input.amount,
        total: input.total,
        abono: input.abono,
        comprobante_id: input.comprobante_id,
      });
      const comprobante = await db.query.comprobantes.findFirst({
        where: eq(schema.comprobantes.id, input.comprobante_id),
        with: {
          family_group: {
            with: { businessUnitData: { with: { brand: true } } },
          },
        },
      });
      return comprobante;
    }),
  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        concept: z.string(),
        amount: z.number(),
        iva: z.number(),
        total: z.number(),
        abono: z.number(),
        comprobante_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const item_changed = await db
        .update(schema.items)
        .set({
          iva: input.iva,
          concept: input.concept,
          amount: input.amount,
          total: input.total,
          abono: input.abono,
          comprobante_id: input.comprobante_id,
        })
        .where(eq(schema.items.id, input.id));
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
