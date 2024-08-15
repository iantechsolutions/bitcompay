import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { postal_code } from "~/server/db/schema";

export const postalCodeRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const postalCode = await db.query.postal_code.findMany({
      with: {
        zoneData: true,
      },
    });
    return postalCode;
  }),
  get: protectedProcedure
    .input(
      z.object({
        postalCodeId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const postalCode = await db.query.postal_code.findFirst({
        where: eq(schema.postal_code.id, input.postalCodeId),
        with: {
          zoneData: true,
        },
      });

      return postalCode;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        cp: z.string(),
        zone: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db.insert(postal_code).values(input);
    }),
  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        cp: z.string(),
        zone: z.string(),
      })
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedpostalCode = await db
        .update(schema.postal_code)
        .set(input)
        .where(eq(schema.postal_code.id, id));
      return updatedpostalCode;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        postalCodeId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.postal_code)
        .where(eq(schema.postal_code.id, input.postalCodeId));
    }),
});
