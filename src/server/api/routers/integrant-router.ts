import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { integrants } from "~/server/db/schema";
import { RouterOutputs } from "~/trpc/shared";

export const integrantsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const integrants = await db.query.integrants.findMany({
      with: {
        contribution: true,
        differentialsValues: true,
      },
    });
    return integrants;
  }),
  get: protectedProcedure
    .input(
      z.object({
        integrantsId: z.string(),
      })
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
      })
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
        gender: z.enum(["MASCULINO", "FEMENINO", "OTRO"]).optional(),
        civil_status: z
          .enum(["SOLTERO", "CASADO", "DIVORCIADO", "VIUDO"])
          .optional(),
        nationality: z.string().optional(),
        afip_status: z.string().optional(),
        extention: z.string().optional(),
        fiscal_id_type: z.string().optional(),
        fiscal_id_number: z.string().optional(),
        address: z.string().optional(),
        address_number: z.string().optional(),
        phone_number: z.string().optional(),
        cellphone_number: z.string().optional(),
        email: z.string().optional(),
        floor: z.string().optional(),
        department: z.string().optional(),
        locality: z.string().optional(),
        partido: z.string().optional(),
        province: z.string().optional(),
        cp: z.string().optional(),
        zone: z.string().optional(),
        isHolder: z.boolean().optional(),
        isPaymentHolder: z.boolean().optional(),
        isAffiliate: z.boolean().optional(),
        isBillResponsiblee: z.boolean().optional(),
        family_group_id: z.string().optional(),
        postal_codeId: z.string(),
        validity: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const integrant = await db.insert(integrants).values(input).returning();

      return integrant;
    }),
  change: protectedProcedure
    .input(
      z.object({
        iva: z.string().optional(),
        id: z.string(),
        affiliate_type: z.string().optional(),
        relationship: z.string().optional(),
        name: z.string(),
        id_type: z.string().optional(),
        id_number: z.string().optional(),
        state: z.string().optional(),
        birth_date: z.date().optional(),
        gender: z.enum(["MASCULINO", "FEMENINO", "OTRO"]),
        civil_status: z.enum(["SOLTERO", "CASADO", "DIVORCIADO", "VIUDO"]),
        nationality: z.string().optional(),
        extention: z.string().optional(),
        afip_status: z.string().optional(),
        fiscal_id_type: z.string().optional(),
        fiscal_id_number: z.string().optional(),
        address: z.string().optional(),
        address_number: z.string().optional(),
        phone_number: z.string().optional(),
        cellphone_number: z.string().optional(),
        email: z.string().optional(),
        floor: z.string().optional(),
        department: z.string().optional(),
        localidad: z.string().optional(),
        partido: z.string().optional(),
        provincia: z.string().optional(),
        cp: z.string().nullable(),
        zona: z.string().nullable(),
        isHolder: z.boolean().optional(),
        isPaymentHolder: z.boolean().optional(),
        isAffiliate: z.boolean().optional(),
        isBillResponsible: z.boolean().optional(),
        family_group_id: z.string().optional(),
        postal_codeId: z.string().optional(),
        validity: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const updatedIntegrants = await db
          .update(schema.integrants)
          .set({
            iva: input.iva,
            id: input.id,
            affiliate_type: input.affiliate_type,
            relationship: input.relationship,
            name: input.name,
            id_type: input.id_type,
            id_number: input.id_number,
            state: input.state,
            birth_date: input.birth_date,
            gender: input.gender,
            civil_status: input.civil_status,
            nationality: input.nationality,
            extention: input.extention,
            afip_status: input.afip_status,
            fiscal_id_type: input.fiscal_id_type,
            fiscal_id_number: input.fiscal_id_number,
            address: input.address,
            address_number: input.address_number,
            phone_number: input.phone_number,
            cellphone_number: input.cellphone_number,
            email: input.email,
            floor: input.floor,
            department: input.department,
            locality: input.localidad,
            partido: input.partido,
            province: input.provincia,
            cp: input.cp,
            zone: input.zona,
            isHolder: input.isHolder,
            isPaymentHolder: input.isPaymentHolder,
            isAffiliate: input.isAffiliate,
            isBillResponsible: input.isBillResponsible,
            family_group_id: input.family_group_id,
            postal_codeId: input.postal_codeId,
            validity: input.validity,
          })
          .where(eq(schema.integrants.id, input.id));

        return updatedIntegrants;
      } catch (error) {
        console.error("Error al actualizar:", error);
        throw new Error("No se pudo actualizar el integrante.");
      }
    }),
  delete: protectedProcedure
    .input(
      z.object({
        integrantsId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.integrants)
        .where(eq(schema.integrants.id, input.integrantsId));
    }),
});

export type Integrant = RouterOutputs["integrants"]["list"][number];
