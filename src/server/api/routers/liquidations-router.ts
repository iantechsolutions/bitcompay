import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";
import { eq, and } from "drizzle-orm";

export const liquidationsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const liquidation_found = await db.query.liquidations.findFirst({
        where: eq(schema.liquidations.id, input.id),
        with: {
          facturas: {
            with: {
              items: true,
              family_group: {
                with: {
                  integrants: {
                    where: eq(schema.integrants.isBillResponsible, true),
                  },
                  plan: true,
                  cc: true,
                },
              },
              liquidations: true,
            },
          },
          bussinessUnits: true,
        },
      });
      return liquidation_found;
    }),
  getFamilyGroups: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const facturas = await db.query.facturas.findMany({
        where: eq(schema.facturas.liquidation_id, input.id),
        with: {
          family_group: {
            with: {
              integrants: {
                where: eq(schema.integrants.isBillResponsible, true),
              },
              plan: true,
              cc: true,
            },
          },
        },
      });
      const familyGroups = facturas.map((factura) => factura.family_group);
      return familyGroups;
    }),
  list: protectedProcedure.query(async () => {
    const liquidations = await db.query.liquidations.findMany({
      with: { bussinessUnits: true },
    });
    return liquidations;
  }),
  create: protectedProcedure
    .input(
      z.object({
        userCreated: z.string(),
        userApproved: z.string(),
        estado: z.string(),
        razonSocial: z.string(),
        periodo: z.date(),
        cuit: z.string(),
        pdv: z.number(),
        interest: z.number().optional(),
        logo_url: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const new_liquidation = await db.insert(schema.liquidations).values({
        userCreated: input.userCreated,
        userApproved: input.userApproved,
        estado: input.estado,
        razon_social: input.razonSocial,
        period: input.periodo,
        cuit: input.cuit,
        pdv: input.pdv,
        number: 1,
        interest: input.interest ?? 0,
        logo_url: input.logo_url,
      });
      return new_liquidation;
    }),
  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        userCreated: z.string(),
        userApproved: z.string(),
        estado: z.string(),
        razonSocial: z.string(),
        periodo: z.date(),
        cuit: z.string(),
        pdv: z.number(),
        logo_url: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const liquidation_changed = await db
        .update(schema.liquidations)
        .set({
          userCreated: input.userCreated,
          userApproved: input.userApproved,
          estado: input.estado,
          razon_social: input.razonSocial,
          period: input.periodo,
          cuit: input.cuit,
          pdv: input.pdv,
          number: 1,
          logo_url: input.logo_url,
        })
        .where(eq(schema.liquidations.id, input.id));
      return liquidation_changed;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const liquidation_deleted = await db
        .delete(schema.liquidations)
        .where(eq(schema.liquidations.id, input.id));
      return liquidation_deleted;
    }),
});
