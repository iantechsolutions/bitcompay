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
        cp: z.string().optional(),
        zona: z.string().optional(),
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
        console.log("Input de la mutación:", input);
        console.log("Nombre:", input.name);
        const updatedIntegrants = await db
          .update(schema.integrants)
          .set(input)
          .where(eq(schema.integrants.id, input.id));

        console.log("bobo", updatedIntegrants);
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
