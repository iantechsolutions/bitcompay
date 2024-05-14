import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { getServerAuthSession } from "~/server/auth";
import { modos } from "~/server/db/schema";




export const modosRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const modos = await db.query.modos.findMany();
    return modos;
  }),
  get: protectedProcedure
    .input(
      z.object({
        modosId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const modos = await db.query.modos.findFirst({
        where: eq(schema.modos.id, input.modosId),
      });

      return modos;
    }),

  create: protectedProcedure
    .input(modos)
    .mutation(async ({ input }) => {
      const session = await getServerAuthSession();
      if (!session || !session.user) {
        throw new Error("User not found");
      }
      const user = session?.user.id;
      const newmodos = await db
        .insert(schema.modos)
        .values({ ...input, user });

      return newmodos;
    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...modos.shape,
      }),
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedmodos = await db
        .update(schema.modos)
        .set(input)
        .where(eq(schema.modos.id, id));
      console.log(updatedmodos);
      return updatedmodos;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        modosId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.modos)
        .where(eq(schema.modos.id, input.modosId));
    }),
});
