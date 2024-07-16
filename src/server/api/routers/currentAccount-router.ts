import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";

export const currentAccountRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const currentAccount = await db.query.currentAccount.findMany({
      with: { events: true },
    });
    return currentAccount;
  }),
  get: protectedProcedure
    .input(
      z.object({
        currentAccountId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const currentAccount = await db.query.currentAccount.findFirst({
        where: eq(schema.currentAccount.id, input.currentAccountId),
        with: { events: true },
      });

      return currentAccount;
    }),
  create: protectedProcedure
    .input(
      z.object({
        company_id: z.string().nullable(),
        family_group: z.string().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const currentAccount = await db.insert(schema.currentAccount).values({
        family_group: input.family_group,
      });

      return currentAccount;
    }),

  update: protectedProcedure
    .input(
      z.object({
        company_id: z.string().nullable(),
        family_group: z.string().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const currentAccount = await db.update(schema.currentAccount);

      return currentAccount;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        currentAccountId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const currentAccount = await db
        .delete(schema.currentAccount)
        .where(eq(schema.currentAccount.id, input.currentAccountId));

      return currentAccount;
    }),
});
