import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { api } from "~/trpc/server";

export const healthInsurancesRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ healthInsuranceId: z.string() }))
    .query(async ({ input, ctx }) => {
      const healthInsurance_found = await db.query.healthInsurances.findFirst({
        where: and(
          eq(schema.healthInsurances.id, input.healthInsuranceId),
          eq(schema.healthInsurances.companyId, ctx.session.orgId!)
        ),
        with: {
          cpData: true,
        },
      });
      return healthInsurance_found;
    }),
  getWithComprobantes: protectedProcedure
    .input(z.object({ healthInsuranceId: z.string() }))
    .query(async ({ input, ctx }) => {
      const healthInsurance_found = await db.query.healthInsurances.findFirst({
        where: and(
          eq(schema.healthInsurances.id, input.healthInsuranceId),
          eq(schema.healthInsurances.companyId, ctx.session.orgId!)
        ),
        with: {
          comprobantes: true,
          cc: true,
          cpData: true,
          // {
          // with:{
          //   items:true
          // }
          // }
        },
      });
      return healthInsurance_found;
    }),
  list: protectedProcedure.query(async ({ input, ctx }) => {
    const companyId = ctx.session.orgId;
    const healthInsurances = await db.query.healthInsurances.findMany({
      where: eq(schema.healthInsurances.companyId, companyId!),
      with: { cpData: true },
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
        fiscal_id_number: z.string().optional(),
        fiscal_id_type: z.string().optional(),
        isClient: z.boolean().optional(),
        responsibleName: z.string().optional(),
        locality: z.string().optional(),
        province: z.string().optional(),
        postal_code: z.string().optional(),
        initialValue: z.string().optional(),
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
        })
        .returning();

      console.log("Tortuga", input.initialValue);
      const cc = await db
        .insert(schema.currentAccount)
        .values({
          company_id: companyId,
          family_group: "",
          health_insurance: new_healthInsurance[0]?.id ?? "",
        })
        .returning();
      const firstEvent = await db.insert(schema.events).values({
        current_amount: parseInt(input?.initialValue ?? "0"),
        description: "Apertura",
        event_amount: parseInt(input?.initialValue ?? "0"),
        currentAccount_id: cc[0]?.id,
        type: "REC",
      });
      return new_healthInsurance;
    }),
  change: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        identificationNumber: z.string(),
        healthInsuranceId: z.string(),
        adress: z.string().optional(),
        afip_status: z.string().optional(),
        fiscal_id_number: z.string().optional(),
        fiscal_id_type: z.string().optional(),
        isClient: z.boolean().optional(),
        responsibleName: z.string().optional(),
        locality: z.string().optional(),
        province: z.string().optional(),
        postal_code: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const healthInsurance_changed = await db
        .update(schema.healthInsurances)
        .set({
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
