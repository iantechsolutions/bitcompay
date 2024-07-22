import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { desc, eq } from "drizzle-orm";
import {
  administrative_audit,
  medical_audit,
  family_groups,
} from "~/server/db/schema";
import { RouterOutputs } from "~/trpc/shared";
export type FamilyListLiquidationId =
  RouterOutputs["family_groups"]["getByLiquidation"][number];

export const family_groupsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const family_groups = await db.query.family_groups.findMany({
      with: {
        modo: true,
        plan: true,
        integrants: true,
        cc: true,
        businessUnitData: {
          with: {
            brand: true,
          },
        },
        comprobantes: {
          with: {
            items: true,
            family_group: {
              with: {
                integrants: true,
              },
            },
          },
        },
      },
    });
    const family_group_reduced = family_groups.filter((family_groups) => {
      return family_groups.businessUnitData?.companyId === ctx.session.orgId!;
    });
    return family_group_reduced;
  }),
  get: protectedProcedure
    .input(
      z.object({
        family_groupsId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const family_groups = await db.query.family_groups.findFirst({
        where: eq(schema.family_groups.id, input.family_groupsId),
        with: {
          businessUnitData: true,
          plan: true,
          modo: true,
          integrants: {
            with: {},
          },
        },
      });

      if (family_groups?.businessUnitData?.companyId === ctx.session.orgId) {
        return family_groups;
      } else null;
    }),

  getByLiquidation: protectedProcedure
    .input(z.object({ liquidationId: z.string() }))
    .query(async ({ input }) => {
      const liquidation = await db.query.liquidations.findFirst({
        where: eq(schema.liquidations.id, input.liquidationId),
        with: {
          comprobantes: {
            where: eq(schema.comprobantes.liquidation_id, input.liquidationId),
            orderBy: [desc(schema.comprobantes.createdAt)],
            with: {
              family_group: {
                with: {
                  plan: true,
                  modo: true,
                  integrants: true,
                  cc: true,
                  businessUnitData: true,
                  comprobantes: {
                    with: {
                      items: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!liquidation) {
        return [];
      }

      const family_groups = liquidation.comprobantes.map(
        (comprobante) => comprobante.family_group
      );

      const uniqueFamilyGroups = family_groups.filter(
        (family_group, index, self) =>
          index === self.findIndex((fg) => fg!.id === family_group!.id)
      );

      const processedFamilyGroups = uniqueFamilyGroups.map((family_group) => {
        const filteredComprobantes = family_group?.comprobantes.filter(
          (comprobante) => comprobante.liquidation_id === input.liquidationId
        );
        return {
          ...family_group,
          comprobantes: filteredComprobantes ?? [],
        };
      });

      return processedFamilyGroups;
    }),

  getbyProcedure: protectedProcedure
    .input(
      z.object({
        procedureId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const family_group = await db.query.family_groups.findFirst({
        where: eq(schema.family_groups.procedureId, input.procedureId),
      });
      return family_group;
    }),
  getByBrand: protectedProcedure
    .input(
      z.object({
        brandId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const family_group = await db.query.family_groups.findMany({
        with: {
          businessUnitData: true,
          abonos: true,
          integrants: {
            with: {
              contribution: true,
              differentialsValues: true,
            },
          },
          bonus: true,
          plan: true,
          modo: true,
        },
      });
      const family_group_reduced = family_group.filter((family_group) => {
        return family_group.businessUnitData?.brandId === input.brandId;
      });
      return family_group_reduced;
    }),
  // getByOrganization: protectedProcedure.query(async ({ ctx }) => {
  //   const companyId = ctx.session.orgId;

  //   const family_group = await db.query.family_groups.findMany({
  //     with: {
  //       businessUnitData: true,
  //       abonos: true,
  //       integrants: {
  //         with: {
  //           contribution: true,
  //           differentialsValues: true,
  //         },
  //       },
  //       bonus: true,
  //       plan: true,
  //       modo: true,
  //     },
  //   });
  //   const family_group_reduced = family_group.filter((family_group) => {
  //     return family_group.businessUnitData?.companyId === companyId!;
  //   });
  //   return family_group_reduced;
  // }),
  create: protectedProcedure
    .input(
      z.object({
        businessUnit: z.string().optional(), // optional() solo con motivos de testing
        validity: z.date(),
        plan: z.string(),
        modo: z.string(),
        receipt: z.string().optional(),
        bonus: z.string().optional(),
        procedureId: z.string().optional(),
        state: z.string().optional(),
        payment_status: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const new_family_group = await db
        .insert(family_groups)
        .values({
          ...input,
        })
        .returning();
      return new_family_group;
    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        businessUnit: z.string().nullable(),
        validity: z.date().nullable(),
        plan: z.string().nullable(),
        modo: z.string().nullable(),
        receipt: z.string().nullable().optional(),
        bonus: z.string().nullable().optional(),
        procedureId: z.string().nullable().optional(),
        state: z.string().nullable().optional(),
        payment_status: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedfamily_groups = await db
        .update(schema.family_groups)
        .set(input)
        .where(eq(schema.family_groups.id, id));
      console.log(updatedfamily_groups);
      return updatedfamily_groups;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        family_groupsId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.family_groups)
        .where(eq(schema.family_groups.id, input.family_groupsId));
    }),
});
