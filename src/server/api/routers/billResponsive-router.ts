import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { getServerAuthSession } from "~/server/auth";
import { billResponsible } from "~/server/db/schema";




export const billResponsibleRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const billResponsibles = await db.query.billResponsible.findMany();
    return billResponsibles;
  }),
  get: protectedProcedure
    .input(
      z.object({
        billResponsibleId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const billResponsible = await db.query.billResponsible.findFirst({
        where: eq(schema.billResponsible.id, input.billResponsibleId),
      });

      return billResponsible;
    }),

    create: protectedProcedure
    .input(z.object({ 
      integrant_id:  z.string(),
      payment_responsible: z.string(),
      name:  z.string(),
      id_type:  z.string(),
      id_number:  z.string(),
      afip_status:  z.string(),
      fiscal_id_type:  z.string(),
      fiscal_id_number:  z.string(),
      cuit:  z.string(),
      payment_holder:  z.string(),
      adress:  z.string(),
      iva:  z.string(),
    
    
    }))
    .mutation(async ({ input }) => {
      
        await db.insert(billResponsible).values({
          adress: input.adress,
          afip_status: input.afip_status,
          cuit: input.cuit,
          fiscal_id_number: input.fiscal_id_number,
          fiscal_id_type: input.fiscal_id_type,
          id_number: input.id_number,
          id_type: input.id_type,
          integrant_id: input.integrant_id,
          iva: input.iva,
          name: input.name,
          payment_holder: input.payment_holder,
          payment_responsive: input.payment_responsive,

        });
      
    }),     
  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        integrant_id:  z.string(),
        payment_responsive: z.string(),
        name:  z.string(),
        id_type:  z.string(),
        id_number:  z.string(),
        afip_status:  z.string(),
        fiscal_id_type:  z.string(),
        fiscal_id_number:  z.string(),
        cuit:  z.string(),
        payment_holder:  z.string(),
        adress:  z.string(),
        iva:  z.string(),
      }),
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedbillResponsible = await db
        .update(schema.billResponsible)
        .set({
          adress: input.adress,
          afip_status: input.afip_status,
          cuit: input.cuit,
          fiscal_id_number: input.fiscal_id_number,
          fiscal_id_type: input.fiscal_id_type,
          id_number: input.id_number,
          id_type: input.id_type,
          integrant_id: input.integrant_id,
          iva: input.iva,
          name: input.name,
          payment_holder: input.payment_holder,
          payment_responsive: input.payment_responsive,
        
        })
        .where(eq(schema.billResponsible.id, id));
      console.log(updatedbillResponsible);
      return updatedbillResponsible;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        billResponsibleId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.billResponsible)
        .where(eq(schema.billResponsible.id, input.billResponsibleId));
    }),
});
