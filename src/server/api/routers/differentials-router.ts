import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";

export const differentialsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const differentials = await db.query.differentials.findMany();
    return differentials;
  }),
  get: protectedProcedure
    .input(
      z.object({
        differentialId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const differential = await db.query.differentials.findFirst({
        where: eq(schema.differentials.id, input.differentialId),
      });

      return differential;
    }),

  create: protectedProcedure
    .input(
      z.object({
        codigo: z.string(),
        descripcion: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const newDifferential = await db
        .insert(schema.differentials)
        .values({ ...input });
      return newDifferential;
    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        codigo: z.string(),
        descripcion: z.string(),
      }),
    )
    .mutation(async ({ input: { id, ...input } }) => {
      const updatedDifferential = await db
        .update(schema.differentials)
        .set(input)
        .where(eq(schema.differentials.id, id));

      return updatedDifferential;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        differentialId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.differentials)
        .where(eq(schema.differentials.id, input.differentialId));
    }),
});
