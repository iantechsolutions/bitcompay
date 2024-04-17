import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
// a partir de ahora
export const statusRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => {
    const status = await db.query.payment_status.findMany();
    return status;
  }),
  get: protectedProcedure
    .input(z.object({ statusId: z.string() }))
    .query(async ({ input }) => {
      const status_found = await db.query.payment_status.findFirst({
        where: eq(schema.payment_status.id, input.statusId),
      });
      return status_found;
    }),
  create: protectedProcedure
    .input(z.object({ description: z.string(), code: z.string() }))
    .mutation(async ({ input }) => {
      const new_status = await db
        .insert(schema.payment_status)
        .values({ code: input.code, description: input.description });
      return new_status;
    }),
  change: protectedProcedure
    .input(
      z.object({
        description: z.string(),
        code: z.string(),
        statusId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const modified_status = await db
        .update(schema.payment_status)
        .set({ description: input.description, code: input.code })
        .where(eq(schema.payment_status.id, input.statusId));
      return modified_status;
    }),
  delete: protectedProcedure
    .input(z.object({ statusId: z.string() }))
    .mutation(async ({ input }) => {
      const deleted_status = await db
        .delete(schema.payment_status)
        .where(eq(schema.payment_status.id, input.statusId));
      return deleted_status;
    }),
});
