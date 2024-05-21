import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";
import { eq, and } from "drizzle-orm";

export const billingDocumentsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const billingDocument_found = await db.query.billingDocuments.findFirst({
        where: eq(schema.billingDocuments.id, input.id),
      });
      return billingDocument_found;
    }),
  list: protectedProcedure.query(async () => {
    const billingDocuments = await db.query.billingDocuments.findMany();
    return billingDocuments;
  }),
  create: protectedProcedure
    .input(
      z.object({
        url: z.string(),
        factura_id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const new_billingDocument = await db
        .insert(schema.billingDocuments)
        .values({
          url: input.url,
          factura_id: input.factura_id,
        });
      return new_billingDocument;
    }),
  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        url: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const billingDocument_changed = await db
        .update(schema.billingDocuments)
        .set({ url: input.url })
        .where(eq(schema.billingDocuments.id, input.id));
      return billingDocument_changed;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const billingDocument_deleted = await db
        .delete(schema.billingDocuments)
        .where(eq(schema.billingDocuments.id, input.id));
      return billingDocument_deleted;
    }),
});
