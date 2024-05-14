import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { getServerAuthSession } from "~/server/auth";
import { integrant } from "~/server/db/schema";




export const integrantRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const integrants = await db.query.integrants.findMany();
    return integrants;
  }),
  get: protectedProcedure
    .input(
      z.object({
        integrantId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const integrant = await db.query.integrants.findFirst({
        where: eq(schema.integrant.id, input.integrantId),
      });

      return integrant;
    }),

  create: protectedProcedure
    .input(integrant)
    .mutation(async ({ input }) => {
      const session = await getServerAuthSession();
      if (!session || !session.user) {
        throw new Error("User not found");
      }
      const user = session?.user.id;
      const newintegrant = await db
        .insert(schema.integrant)
        .values({ ...input, user });

      return newintegrant;
    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...integrant.shape,
      }),
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedintegrant = await db
        .update(schema.integrant)
        .set(input)
        .where(eq(schema.integrant.id, id));
      console.log(updatedintegrant);
      return updatedintegrant;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        integrantId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.integrant)
        .where(eq(schema.integrant.id, input.integrantId));
    }),
});
