import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { getServerAuthSession } from "~/server/auth";
import { integrants } from "~/server/db/schema";




export const integrantsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const integrants = await db.query.integrants.findMany();
    return integrants;
  }),
  get: protectedProcedure
    .input(
      z.object({
        integrantsId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const integrants = await db.query.integrants.findFirst({
        where: eq(schema.integrants.id, input.integrantsId),
      });

      return integrants;
    }),

    create: protectedProcedure
    .input(z.object({ 
      iva:z.string(),
      affiliate_type:z.string(),
      relationship: z.string(),
      name: z.string(),
      id_type: z.string(),
      id_number: z.string(),
      birth_date: z.string().transform(value => new Date(value)),
      gender: z.enum(["female", "male", "other"]),
      civil_status: z.enum(["single", "married", "divorced", "widowed"]),
      nationality:z.string(),
      afip_status:z.string(),
      fiscal_id_type: z.string(),
      fiscal_id_number: z.string(),
      address: z.string(),
      phone_number: z.string(),
      cellphone_number: z.string(),
      email: z.string(),
      floor: z.string(),
      department: z.string(),
      lacality: z.string(),
      partido: z.string(),
      state: z.string(),
      cp: z.string(),
      zone: z.string(),
      isHolder:  z.boolean(),
      isPaymentHolder: z.boolean(),
      isAffiliate: z.boolean(),
      isBillResponsiblee: z.boolean(),
      family_group_id: z.string().optional(),
      differentialValues_id: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      
      const integrant = await db.insert(integrants).values(input).returning();
      
      return integrant;
  
      }), 
  change: protectedProcedure
    .input(
      z.object({
        iva: z.string(),
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
        isBillResponsible: z.boolean(),
        family_group_id: z.string(),
        differentialValues_id: z.string(),
        }),
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedintegrants = await db
        .update(schema.integrants)
        .set(input)
        .where(eq(schema.integrants.id, id));
      console.log(updatedintegrants);
      return updatedintegrants;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        integrantsId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.integrants)
        .where(eq(schema.integrants.id, input.integrantsId));
    }),
});
