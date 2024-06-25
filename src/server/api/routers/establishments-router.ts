import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { schema, db } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const establishmentsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        establishmentId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const establishment = await db.query.establishments.findFirst({
        where: eq(schema.establishments.id, input.establishmentId),
      });
      return establishment;
    }),
  list: protectedProcedure.query(async () => {
    return await db.query.establishments.findMany();
  }),
  create: protectedProcedure
    .input(
      z.object({
        flag: z.string(),
        brandId: z.string(),
        establishment_number: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const establishment = await db.insert(schema.establishments).values({
        establishment_number: Number(input.establishment_number),
        flag: input.flag,
        brandId: input.brandId,
      });
      return establishment;
    }),
  change: protectedProcedure
    .input(
      z.object({
        establishmentId: z.string(),
        flag: z.string(),
        establishment_number: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(schema.establishments)
        .set({
          establishment_number: Number(input.establishment_number),
          flag: input.flag,
        })
        .where(eq(schema.establishments.id, input.establishmentId));
    }),
  delete: protectedProcedure
    .input(z.object({ establishmentId: z.string() }))
    .mutation(async ({ input }) => {
      await db
        .delete(schema.establishments)
        .where(eq(schema.establishments.id, input.establishmentId));
    }),
});
