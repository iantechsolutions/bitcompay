import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export const liquidationsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const liquidation_found = await db.query.liquidations.findFirst({
        where: eq(schema.liquidations.id, input.id),
        with: {
          comprobantes: {
            with: {
              items: true,
              payments: true,
              family_group: {
                with: {
                  plan: true,
                  modo: true,
                  integrants: {
                    with: { differentialsValues: true },
                    where: eq(schema.integrants.isBillResponsible, true),
                  },
                  cc: true,
                  businessUnitData: true,
                  comprobantes: {
                    with: {
                      items: true,
                    },
                  },
                },
              },
              liquidations: true,
              //
            },
          },
          bussinessUnits: true,
          brand: { with: { company: true } },
        },
      });
      if (
        liquidation_found?.brand?.company.some(
          (x) => x.companyId === ctx.session.orgId
        )
      ) {
        return liquidation_found;
      } else null;
    }),
  getFamilyGroups: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const comprobantes = await db.query.comprobantes.findMany({
        where: eq(schema.comprobantes.liquidation_id, input.id),
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
      const familyGroups = comprobantes.map(
        (comprobante) => comprobante.family_group
      );
      return familyGroups;
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const liquidations = await db.query.liquidations.findMany({
      with: { bussinessUnits: true, brand: { with: { company: true } } },
    });
    return liquidations.filter((x) =>
      x.brand?.company.some((x) => x.companyId === ctx.session.orgId)
    );
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
        number: z.number(),
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
        number: input.number,
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
        number: z.number(),
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
          number: input.number,
          pdv: input.pdv,
          logo_url: input.logo_url,
        })
        .where(eq(schema.liquidations.id, input.id));
      return liquidation_changed;
    }),
  rejectLiquidation: protectedProcedure
    .input(z.object({ liquidationId: z.string() }))
    .mutation(async ({ input }) => {
      const liquidation_rejected = await db
        .update(schema.liquidations)
        .set({
          estado: "rechazado",
        })
        .where(eq(schema.liquidations.id, input.liquidationId));
      const comprobantes = await db.query.comprobantes.findMany({
        where: eq(schema.comprobantes.liquidation_id, input.liquidationId),
      });
      for (const comprobante of comprobantes) {
        await db
          .delete(schema.items)
          .where(eq(schema.items.comprobante_id, comprobante.id));
        await db
          .delete(schema.comprobantes)
          .where(eq(schema.comprobantes.id, comprobante.id));
      }
      return liquidation_rejected;
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
