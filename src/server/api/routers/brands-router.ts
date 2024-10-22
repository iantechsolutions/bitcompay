import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { createId } from "~/lib/utils";
import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { RouterOutputs } from "~/trpc/shared";
import { brands } from "~/server/db/schema";

export const brandsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        brandId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const brand = await db.query.brands.findFirst({
        where: eq(schema.brands.id, input.brandId),
        with: {
          establishments: true,
          company: {
            columns: {
              companyId: false,
              brandId: false,
            },
            with: {
              company: {
                columns: {
                  name: true,
                  id: true,
                },
              },
            },
          },
        },
      });

      return brand;
    }),
  CompleteList: protectedProcedure.query(async ({ ctx }) => {
    const brands = await db.query.brands.findMany();

    return brands;
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const brands = await db.query.brands.findMany({
      with: { company: true, establishments: true },
    });

    return brands.filter((x) =>
      x.company.some((x) => x.companyId === ctx.session.orgId)
    );
  }),

  // getbyCurrentCompany: protectedProcedure.query(async ({ ctx }) => {
  //   const companyId = ctx.session.orgId;
  //   const company = await db.query.companies.findMany({
  //     where: eq(schema.companies.id, companyId!),
  //     with: {
  //       brands: {
  //         with: {
  //           brand: true,
  //         },
  //       },
  //     },
  //   });
  //   return company?.brands.map((b) => b.brand);
  // }),
  // getBrandsByCompany: protectedProcedure
  //   .input(z.object({ companyId: z.string() }))
  //   .query(async ({ input }) => {
  //     const brands = await db.query.companiesToBrands.findMany({
  //       where: eq(schema.companiesToBrands.companyId, input.companyId),
  //       with: {
  //         brand: true,
  //       },
  //     });
  //     return brands.map((b) => b.brand);
  //   }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().min(0).max(1023),
        redescription: z.string().min(0).max(10),
        iva: z.string().optional(),
        billType: z.string().optional(),
        utility: z.string().optional(),
        concept: z.string().optional(),
        code: z.string().optional(),
        pv: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: verificar permisos

      const newBrand = await db
        .insert(brands)
        .values({
          ...input,
          prisma_code: input.code,
        })
        .returning();
      return newBrand;
    }),

  change: protectedProcedure
    .input(
      z.object({
        brandId: z.string(),
        name: z.string().min(1).max(255),
        description: z.string().min(0).max(1023).optional(),
        reducedDescription: z.string().min(0).max(10).optional(),
        iva: z.string().optional(),
        billType: z.string().optional(),
        code: z.string().optional(),
        utility: z.string().optional(),
        companiesId: z.set(z.string()),
        concept: z.string().optional(),
        pv: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(schema.brands)
        .set({
          name: input.name,
          description: input.description,
          redescription: input.reducedDescription,
          iva: input.iva,
          prisma_code: input.code,
          bill_type: input.billType,
          concept: input.concept,
          utility: input.utility,
          pv: input.pv,
        })
        .where(eq(schema.brands.id, input.brandId));

      await db
        .delete(schema.companiesToBrands)
        .where(eq(schema.companiesToBrands.brandId, input.brandId));
      for (const companyId of input.companiesId) {
        await db
          .insert(schema.companiesToBrands)
          .values({ brandId: input.brandId, companyId: companyId });
      }
    }),

  changeKeepCompany: protectedProcedure
    .input(
      z.object({
        brandId: z.string(),
        name: z.string().min(1).max(255),
        description: z.string().min(0).max(1023).optional(),
        reducedDescription: z.string().min(0).max(10).optional(),
        iva: z.string().optional(),
        billType: z.string().optional(),
        concept: z.string().optional(),
        pv: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(schema.brands)
        .set({
          name: input.name,
          description: input.description,
          redescription: input.reducedDescription,
          iva: input.iva,
          bill_type: input.billType,
          concept: input.concept,
          pv: input.pv,
        })
        .where(eq(schema.brands.id, input.brandId));
    }),

  delete: protectedProcedure
    .input(
      z.object({
        brandId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const businessUnits = await db.query.bussinessUnits.findMany({
        where: eq(schema.bussinessUnits.brandId, input.brandId),
      });

      const familyGroupsIds = (
        await db.query.family_groups.findMany({
          where: inArray(
            schema.family_groups.businessUnit,
            businessUnits.map((v) => v.id)
          ),
        })
      ).map((v) => v.id);

      const integrantsIds = (
        await db.query.integrants.findMany({
          where: inArray(schema.integrants.family_group_id, familyGroupsIds),
        })
      ).map((v) => v.id);

      await db.transaction(async (tx) => {
        await tx
          .delete(schema.liquidations)
          .where(eq(schema.liquidations.brandId, input.brandId));
        await tx
          .delete(schema.uploadedOutputFiles)
          .where(eq(schema.uploadedOutputFiles.brandId, input.brandId));
        await tx
          .delete(schema.differentialsValues)
          .where(
            inArray(schema.differentialsValues.integrant_id, integrantsIds)
          );
        await tx
          .delete(schema.pa)
          .where(inArray(schema.pa.integrant_id, integrantsIds));
        await tx
          .delete(schema.integrants)
          .where(inArray(schema.integrants.id, integrantsIds));
        await tx
          .delete(schema.family_groups)
          .where(inArray(schema.family_groups.id, familyGroupsIds));
        await tx
          .delete(schema.plans)
          .where(eq(schema.plans.brand_id, input.brandId));
        await tx
          .delete(schema.bussinessUnits)
          .where(eq(schema.bussinessUnits.brandId, input.brandId));
        await tx
          .delete(schema.brands)
          .where(eq(schema.brands.id, input.brandId));
        await tx
          .delete(schema.companiesToBrands)
          .where(eq(schema.companiesToBrands.brandId, input.brandId));
      });
    }),

  addRelation: protectedProcedure
    .input(z.object({ companyId: z.string(), brandId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const companyId = ctx.session.orgId;
      await db
        .insert(schema.companiesToBrands)
        .values({ brandId: input.brandId, companyId: companyId! });
    }),

  deleteRelation: protectedProcedure
    .input(z.object({ companyId: z.string(), brandId: z.string() }))
    .mutation(async ({ input }) => {
      await db
        .delete(schema.companiesToBrands)
        .where(
          and(
            eq(schema.companiesToBrands.companyId, input.companyId),
            eq(schema.companiesToBrands.brandId, input.brandId)
          )
        );
    }),
});

export type Brand = RouterOutputs["brands"]["list"][number];
