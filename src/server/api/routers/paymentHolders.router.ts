import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { getServerAuthSession } from "~/server/auth";
import { paymentHolders } from "~/server/db/schema";




export const paymentHoldersRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const paymentHolderss = await db.query.paymentHolderss.findMany();
    return paymentHolderss;
  }),
  get: protectedProcedure
    .input(
      z.object({
        paymentHoldersId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const paymentHolders = await db.query.paymentHolderss.findFirst({
        where: eq(schema.paymentHolders.id, input.paymentHoldersId),
      });

      return paymentHolders;
    }),

  create: protectedProcedure
    .input(paymentHolders)
    .mutation(async ({ input }) => {
      const session = await getServerAuthSession();
      if (!session || !session.user) {
        throw new Error("User not found");
      }
      const user = session?.user.id;
      const newpaymentHolders = await db
        .insert(schema.paymentHolders)
        .values({ ...input, user });

      return newpaymentHolders;
    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...paymentHolders.shape,
      }),
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedpaymentHolders = await db
        .update(schema.paymentHolders)
        .set(input)
        .where(eq(schema.paymentHolders.id, id));
      console.log(updatedpaymentHolders);
      return updatedpaymentHolders;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        paymentHoldersId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.paymentHolders)
        .where(eq(schema.paymentHolders.id, input.paymentHoldersId));
    }),
});
