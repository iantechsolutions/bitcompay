import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";
import { eq, and } from "drizzle-orm";

export const clientStatusesRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ clientStatusId: z.string() }))
    .query(async ({ input }) => {
      const clientStatus_found = await db.query.clientStatuses.findFirst({
        where: eq(schema.clientStatuses.id, input.clientStatusId),
      });
      return clientStatus_found;
    }),
  list: protectedProcedure.query(async () => {
    const clientStatuses = await db.query.clientStatuses.findMany();
    return clientStatuses;
  }),
  create: protectedProcedure
    .input(z.object({ description: z.string(), type: z.string() }))
    .mutation(async ({ input }) => {
      const new_clientStatus = await db
        .insert(schema.clientStatuses)
        .values({ type: input.type, description: input.description });
      return new_clientStatus;
    }),
  change: protectedProcedure
    .input(
      z.object({
        description: z.string(),
        type: z.string(),
        clientStatusId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const clientStatus_changed = await db
        .update(schema.clientStatuses)
        .set({ type: input.type, description: input.description })
        .where(eq(schema.clientStatuses.id, input.clientStatusId));
      return clientStatus_changed;
    }),
  delete: protectedProcedure
    .input(z.object({ clientStatusId: z.string() }))
    .mutation(async ({ input }) => {
      const clientStatus_deleted = await db
        .delete(schema.clientStatuses)
        .where(eq(schema.clientStatuses.id, input.clientStatusId));
      return clientStatus_deleted;
    }),
});
