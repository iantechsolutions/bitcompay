import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { getServerAuthSession } from "~/server/auth";
import { ProviderSchemaDB } from "~/server/db/schema";

export const providersRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ }) => {
    const providers = await db.query.providers.findMany();
    return providers;
  }),
  get: protectedProcedure
    .input(
      z.object({
        providerId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const provider = await db.query.providers.findFirst({
        where: eq(schema.providers.id, input.providerId),
      });

      return provider;
    }),

  create: protectedProcedure
    .input(ProviderSchemaDB)
    .mutation(async ({ input, ctx }) => {
      const newProvider = await db
        .insert(schema.providers)
        .values({
          ...input,
          user: ctx.session.user.id
        });

      return newProvider;
    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...ProviderSchemaDB.shape,
      }),
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedProvider = await db
        .update(schema.providers)
        .set(input)
        .where(eq(schema.providers.id, id));
      console.log(updatedProvider);
      return updatedProvider;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        providerId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.providers)
        .where(eq(schema.providers.id, input.providerId));
    }),
});
