import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { getServerAuthSession } from "~/server/auth";
import { integrant } from "~/server/db/schema";




export const integrantRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const integrants = await db.query.integrant.findMany();
    return integrants;
  }),
  get: protectedProcedure
    .input(
      z.object({
        integrantId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const integrant = await db.query.integrant.findFirst({
        where: eq(schema.integrant.id, input.integrantId),
      });

      return integrant;
    }),

    create: protectedProcedure
    .input(z.object({ 
      affiliate_type: z.string(),
      relationship: z.string(),
      name:z.string(),
      id_type: z.string(),
      id_number: z.string(),
      birth_date: z.string().transform(value => new Date(value)),
      gender: z.enum(["female", "male", "other"]),
      civil_status: z.enum(["single", "married", "divorced", "widowed"]),
      nationality: z.string(),
      afip_status: z.string(),
      fiscal_id_type: z.string(),
      fiscal_id_number: z.string(),
      address: z.string(),
      phone_number: z.string(),
      cellphone_number: z.string(),
      email:z.string(),
      floor: z.string(),
      department: z.string(),
      localidad: z.string(),
      partido: z.string(),
      provincia: z.string(),
      cp: z.string(),
      zona: z.string(),
      isHolder:  z.boolean(),
      isPaymentHolder: z.boolean(),
      isAffiliate: z.boolean(),
      isBillResponsive: z.boolean(),
      paymentHolders_id: z.string(),
      BillResponsiveid: z.string()
    
    }))
    .mutation(async ({ input }) => {
      
      await db.insert(integrant).values(input);
    
  
      }), 
  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        affiliate_type: z.string(),
        relationship: z.string(),
        name:z.string(),
        id_type: z.string(),
        id_number: z.string(),
        birth_date: z.string().transform(value => new Date(value)),
        gender: z.enum(["female", "male", "other"]),
        civil_status: z.enum(["single", "married", "divorced", "widowed"]),
        nationality: z.string(),
        afip_status: z.string(),
        fiscal_id_type: z.string(),
        fiscal_id_number: z.string(),
        address: z.string(),
        phone_number: z.string(),
        cellphone_number: z.string(),
        email:z.string(),
        floor: z.string(),
        department: z.string(),
        localidad: z.string(),
        partido: z.string(),
        provincia: z.string(),
        cp: z.string(),
        zona: z.string(),
        isHolder:  z.boolean(),
        isPaymentHolder: z.boolean(),
        isAffiliate: z.boolean(),
        isBillResponsive: z.boolean(),
        paymentHolders_id: z.string(),
      BillResponsiveid: z.string()
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
