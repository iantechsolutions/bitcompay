import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { zone } from "~/server/db/schema";

export const zoneRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const zone = await db.query.zone.findMany();
    return zone;
  }),
  get: protectedProcedure
    .input(
      z.object({
        zoneId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const zone = await db.query.zone.findFirst({
        where: eq(schema.zone.id, input.zoneId),
      });

      return zone;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db.insert(zone).values(input);
    }),
  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedzone = await db
        .update(schema.zone)
        .set(input)
        .where(eq(schema.zone.id, id));
      return updatedzone;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        zoneId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db.delete(schema.zone).where(eq(schema.zone.id, input.zoneId));
    }),
});
