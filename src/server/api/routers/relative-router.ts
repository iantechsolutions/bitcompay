import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { insertrelativeSchema, relative } from "~/server/db/schema";

export const relativeRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const relative = await db.query.relative.findMany();
    return relative;
  }),
  get: protectedProcedure
    .input(
      z.object({
        relativeId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const relative = await db.query.relative.findFirst({
        where: eq(schema.relative.id, input.relativeId),
      });

      return relative;
    }),
  create: protectedProcedure
    .input(insertrelativeSchema)
    .mutation(async ({ input }) => {
      const new_family_group = await db
        .insert(relative)
        .values({
          ...input,
        })
        .returning();
      return new_family_group;
    }),

  change: protectedProcedure
    .input(insertrelativeSchema)
    .mutation(async ({ input: { id, ...input } }) => {
      const updatedrelative = await db
        .update(schema.relative)
        .set(input)
        .where(eq(schema.relative.id, id!));
      console.log(updatedrelative);
      return updatedrelative;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        relativeId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.relative)
        .where(eq(schema.relative.id, input.relativeId));
    }),
});
