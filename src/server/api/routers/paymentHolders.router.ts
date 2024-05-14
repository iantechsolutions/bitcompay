import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { getServerAuthSession } from "~/server/auth";
import { paymentHolders } from "~/server/db/schema";




export const paymentHoldersRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const paymentHolderss = await db.query.paymentHolders.findMany();
    return paymentHolderss;
  }),
  get: protectedProcedure
    .input(
      z.object({
        paymentHoldersId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const paymentHolders = await db.query.paymentHolders.findFirst({
        where: eq(schema.paymentHolders.id, input.paymentHoldersId),
      });

      return paymentHolders;
    }),

    create: protectedProcedure
    .input(z.object({
      name: z.string(),
      integrant_id:  z.number(),
      id_type: z.string(),
      id_number: z.string(),
      cuit: z.string(),
      afip_status: z.string(),
      fiscal_id_type: z.string(),
      fiscal_id_number: z.string(),
      address: z.string(),
      iva: z.string(),
      integrant_id: z.string()

}))
.mutation(async ({ input }) => {
      
    await db.insert(paymentHolders).values(input);
  

    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        id_type: z.string(),
        id_number: z.string(),
        cuit: z.string(),
        afip_status: z.string(),
        fiscal_id_type: z.string(),
        fiscal_id_number: z.string(),
        address: z.string(),
        iva: z.string(),
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
