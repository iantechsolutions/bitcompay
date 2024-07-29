import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const healthInsurancesRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ healthInsuranceId: z.string() }))
    .query(async ({ input, ctx }) => {
      const healthInsurance_found = await db.query.healthInsurances.findFirst({
        where: and(
          eq(schema.healthInsurances.id, input.healthInsuranceId),
          eq(schema.healthInsurances.companyId, ctx.session.orgId!)
        ),
      });
      return healthInsurance_found;
    }),
  list: protectedProcedure.query(async ({ input, ctx }) => {
    const companyId = ctx.session.orgId;
    const healthInsurances = await db.query.healthInsurances.findMany({
      where: eq(schema.healthInsurances.companyId, companyId!),
    });
    return healthInsurances;
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        identificationNumber: z.string(),
        adress: z.string().optional(),
        afip_status: z.string().optional(),
        fiscal_id_number: z.number().optional(),
        fiscal_id_type: z.string().optional(),
        isClient: z.boolean().optional(),
        responsibleName: z.string().optional(),
        locality: z.string().optional(),
        province: z.string().optional(),
        postal_code: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const companyId = ctx.session.orgId;
      const new_healthInsurance = await db
        .insert(schema.healthInsurances)
        .values({
          companyId,
          name: input.name,
          identificationNumber: input.identificationNumber,
          adress: input.adress,
          afip_status: input.afip_status,
          fiscal_id_number: input.fiscal_id_number,
          fiscal_id_type: input.fiscal_id_type,
          isClient: input.isClient,
          responsibleName: input.responsibleName,
          locality: input.locality,
          province: input.province,
          postal_code: input.postal_code,
        });
      return new_healthInsurance;
    }),
  change: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        identificationNumber: z.string(),
        healthInsuranceId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const healthInsurance_changed = await db
        .update(schema.healthInsurances)
        .set({
          name: input.name,
          identificationNumber: input.identificationNumber,
        })
        .where(eq(schema.healthInsurances.id, input.healthInsuranceId));
      return healthInsurance_changed;
    }),
  delete: protectedProcedure
    .input(z.object({ healthInsuranceId: z.string() }))
    .mutation(async ({ input }) => {
      const healthInsurance_deleted = await db
        .delete(schema.healthInsurances)
        .where(eq(schema.healthInsurances.id, input.healthInsuranceId));
      return healthInsurance_deleted;
    }),
});
