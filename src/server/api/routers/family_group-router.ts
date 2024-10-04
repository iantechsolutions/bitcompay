import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { desc, eq, inArray } from "drizzle-orm";
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
        integrants: {
          with: {
            postal_code: true,
          },
        },
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
    console.log("orgId", ctx.session.orgId);
    const family_group_reduced = family_groups.filter((family_groups) => {
      return family_groups.businessUnitData?.companyId === ctx.session.orgId!;
    });
    return family_group_reduced;
  }),
  listWithIntegrantsPlanAndModo: protectedProcedure.query(async ({ ctx }) => {
    const family_groups = await db.query.family_groups.findMany({
      with: {
        modo: true,
        plan: true,
        integrants: {
          with: {
            postal_code: true,
          },
        },
        businessUnitData: {
          with: {
            brand: true,
          },
        },
      },
    });
    console.log("orgId", ctx.session.orgId);
    const family_group_reduced = family_groups.filter((family_groups) => {
      return family_groups.businessUnitData?.companyId === ctx.session.orgId!;
    });
    return family_group_reduced;
  }),

  NAmountWithIntegransPlanAndModo: protectedProcedure
    .input(
      z.object({
        skipAmount: z.number(),
        takeAmount: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const validBusinessUnits = await db.query.bussinessUnits.findMany({
        where: eq(schema.bussinessUnits.companyId, ctx.session.orgId ?? ""),
      });

      if (validBusinessUnits.length == 0) return [];
      const family_groups = await db.query.family_groups.findMany({
        with: {
          modo: true,
          plan: true,
          integrants: {
            with: {
              postal_code: true,
            },
          },
          businessUnitData: {
            with: {
              brand: true,
            },
          },
        },
        where: inArray(
          schema.family_groups.businessUnit,
          validBusinessUnits.map((x) => x.id)
        ),
        limit: input.takeAmount,
        offset: input.skipAmount,
      });

      // console.log("orgId", ctx.session.orgId);
      // const family_group_reduced = family_groups.filter((family_groups) => {
      //   return family_groups.businessUnitData?.companyId === ctx.session.orgId!;
      // });
      return family_groups;
    }),
  GetLength: protectedProcedure.query(async ({ ctx, input }) => {
    const validBusinessUnits = await db.query.bussinessUnits.findMany({
      where: eq(schema.bussinessUnits.companyId, ctx.session.orgId ?? ""),
    });

    if (validBusinessUnits.length == 0) return 0;
    const family_groups = await db.query.family_groups.findMany({
      with: {
        modo: true,
        plan: true,
        integrants: {
          with: {
            postal_code: true,
          },
        },
        businessUnitData: {
          with: {
            brand: true,
          },
        },
      },
      where: inArray(
        schema.family_groups.businessUnit,
        validBusinessUnits.map((x) => x.id)
      ),
    });

    // console.log("orgId", ctx.session.orgId);
    // const family_group_reduced = family_groups.filter((family_groups) => {
    //   return family_groups.businessUnitData?.companyId === ctx.session.orgId!;
    // });
    return family_groups.length;
  }),

  getWithFilteredComprobantes: protectedProcedure
    .input(
      z.object({
        family_groupId: z.string(),
        liquidation_id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const family_groups = await db.query.family_groups.findFirst({
        where: eq(schema.family_groups.id, input.family_groupId),
        with: {
          businessUnitData: true,
          plan: true,
          modo: true,
          bonus: true,
          comprobantes: true,
          integrants: {
            with: {
              contribution: true,
              differentialsValues: true,
              pa: true,
            },
          },
        },
      });
      family_groups?.comprobantes.filter(
        (x) => x.liquidation_id === input.liquidation_id
      );

      if (family_groups?.businessUnitData?.companyId === ctx.session.orgId) {
        return family_groups;
      } else null;
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
          bonus: true,
          comprobantes: {
            with: {
              items: true,
            },
          },
          integrants: {
            with: {
              contribution: true,
              differentialsValues: true,
              pa: {
                with: {
                  product: true,
                },
              },
              healthInsurances: true,
              originatingHealthInsurances: true,
            },
          },
        },
      });

      if (family_groups?.businessUnitData?.companyId === ctx.session.orgId) {
        return family_groups;
      } else null;
    }),

  getByLiquidation: protectedProcedure
    .input(z.object({ liquidationId: z.string() }))
    .query(async ({ input, ctx }) => {
      const fg = await db.query.family_groups.findMany({
        with: {
          plan: true,
          modo: true,
          integrants: { with: { differentialsValues: true } },
          cc: true,
          businessUnitData: true,
          comprobantes: {
            with: {
              items: true,
            },
          },
        },
      });
      const fgCompany = fg.filter(
        (x) => x.businessUnitData?.companyId === ctx.session.orgId
      );

      // Filtra los comprobantes por `liquidationId` dentro de cada grupo familiar
      const fgFiltered = fgCompany
        .map((group) => {
          const filteredComprobantes = group.comprobantes.filter(
            (comprobante) => comprobante.liquidation_id === input.liquidationId
          );
          // Si hay comprobantes filtrados, devuelve el grupo con los comprobantes filtrados
          if (filteredComprobantes.length > 0) {
            return {
              ...group,
              comprobantes: filteredComprobantes,
            };
          }
          return null;
        })
        .filter((group) => group !== null); // Filtra los grupos nulos

      return fgFiltered;
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
  getbyPlans: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const family_group = await db.query.family_groups.findFirst({
        where: eq(schema.family_groups.plan, input.planId),
      });

      return family_group ? { data: family_group } : { data: null };
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
        entry_date: z.date(),
        sale_condition: z.string().optional(),
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
        sale_condition: z.string().optional(),
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
// const fgFiltered = fg.filter((family_group)=>{

// })
// const liquidation = await db.query.liquidations.findFirst({
//   where: eq(schema.liquidations.id, input.liquidationId),
//   with: {
//     comprobantes: {
//       where: eq(schema.comprobantes.liquidation_id, input.liquidationId),
//       orderBy: [desc(schema.comprobantes.createdAt)],
//       with: {
//         family_group: {
//           with: {
//             plan: true,
//             modo: true,
//             integrants: true,
//             cc: true,
//             businessUnitData: true,
//             comprobantes: {
//               with: {
//                 items: true,
//               },
//             },
//           },
//         },
//       },
//     },
//   },
// });

// if (!liquidation) {
//   return [];
// }

// const family_groups = liquidation.comprobantes.map(
//   (comprobante) => comprobante.family_group
// );

// const uniqueFamilyGroups = family_groups.filter(
//   (family_group, index, self) =>
//     index === self.findIndex((fg) => fg!.id === family_group!.id)
// );

// const processedFamilyGroups = uniqueFamilyGroups.map((family_group) => {
//   const filteredComprobantes = family_group?.comprobantes.filter(
//     (comprobante) => comprobante.liquidation_id === input.liquidationId
//   );
//   return {
//     ...family_group,
//     comprobantes: filteredComprobantes ?? [],
//   };
// });
