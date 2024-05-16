import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { getServerAuthSession } from "~/server/auth";
import { bonuses } from "~/server/db/schema";
import { bonusesSchemaDB } from "~/server/db/schema";



export const bonusesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const bonuses = await db.query.bonuses.findMany();
    return bonuses;
  }),
  get: protectedProcedure
    .input(
      z.object({
        bonusesId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const bonuses = await db.query.bonuses.findFirst({
        where: eq(schema.bonuses.id, input.bonusesId),
      });

      return bonuses;
    }),

  create: protectedProcedure
    .input(bonusesSchemaDB)
    .mutation(async ({ input }) => {
      const session = await getServerAuthSession();
      if (!session || !session.user) {
        throw new Error("User not found");
      }
      const user = session?.user.id;
      const newbonuses = await db
        .insert(schema.bonuses)
        .values({ ...input});

      return newbonuses;
    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...bonusesSchemaDB.shape,
      }),
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedbonuses = await db
        .update(schema.bonuses)
        .set(input)
        .where(eq(schema.bonuses.id, id));
      console.log(updatedbonuses);
      return updatedbonuses;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        bonusesId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.bonuses)
        .where(eq(schema.bonuses.id, input.bonusesId));
    }),
});
