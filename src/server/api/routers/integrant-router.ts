import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
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
  getByGroup: protectedProcedure
    .input(
      z.object({
        family_group_id: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const integrants = await db.query.integrants.findMany({
        where: eq(schema.integrants.family_group_id, input.family_group_id),
      });
      return integrants;
    }),
  create: protectedProcedure
    .input(
      z.object({
        iva: z.string().optional().optional(),
        affiliate_type: z.string().optional(),
        relationship: z.string().optional(),
        name: z.string().optional(),
        id_type: z.string().optional(),
        id_number: z.string().optional(),
        birth_date: z.date().optional(),
        gender: z.enum(["female", "male", "other"]).optional(),
        civil_status: z
          .enum(["soltero", "casado", "divorciado", "viudo"])
          .optional(),
        nationality: z.string().optional(),
        afip_status: z.string().optional(),
        fiscal_id_type: z.string().optional(),
        fiscal_id_number: z.string().optional(),
        address: z.string().optional(),
        phone_number: z.string().optional(),
        cellphone_number: z.string().optional(),
        email: z.string().optional(),
        floor: z.string().optional(),
        department: z.string().optional(),
        lacality: z.string().optional(),
        partido: z.string().optional(),
        state: z.string().optional(),
        cp: z.string().optional(),
        zone: z.string().optional(),
        isHolder: z.boolean().optional(),
        isPaymentHolder: z.boolean().optional(),
        isAffiliate: z.boolean().optional(),
        isBillResponsiblee: z.boolean().optional(),
        family_group_id: z.string().optional(),
        postal_codeId: z.string(),
      }),
    )
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
        name: z.string(),
        id_type: z.string(),
        id_number: z.string(),
        birth_date: z.string().transform((value) => new Date(value)),
        gender: z.enum(["female", "male", "other"]),
        civil_status: z.enum(["soltero", "casado", "divorciado", "viudo"]),
        nationality: z.string(),
        afip_status: z.string(),
        fiscal_id_type: z.string(),
        fiscal_id_number: z.string(),
        address: z.string(),
        phone_number: z.string(),
        cellphone_number: z.string(),
        email: z.string(),
        floor: z.string(),
        department: z.string(),
        localidad: z.string(),
        partido: z.string(),
        provincia: z.string(),
        cp: z.string(),
        zona: z.string(),
        isHolder: z.boolean(),
        isPaymentHolder: z.boolean(),
        isAffiliate: z.boolean(),
        isBillResponsible: z.boolean(),
        family_group_id: z.string(),
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
            await db.delete(schema.integrants).where(eq(schema.integrants.id, input.integrantsId))
        }),
})
