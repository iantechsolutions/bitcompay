import { and, eq } from "drizzle-orm";
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

  list: protectedProcedure.query(async () => {
    return await db.query.brands.findMany();
  }),
  getbyCurrentCompany: protectedProcedure.query(async ({ ctx }) => {
    const companyId = ctx.session.orgId;
    const company = await db.query.companies.findFirst({
      where: eq(schema.companies.id, companyId!),
      with: {
        brands: {
          with: {
            brand: true,
          },
        },
      },
    });
    return company?.brands.map((b) => b.brand);
  }),
  getBrandsByCompany: protectedProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ input }) => {
      const brands = await db.query.companiesToBrands.findMany({
        where: eq(schema.companiesToBrands.companyId, input.companyId),
        with: {
          brand: true,
        },
      });
      return brands.map((b) => b.brand);
    }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().min(0).max(1023),
        redescription: z.string().min(0).max(10),
        iva: z.string().optional(),
        billType: z.string().optional(),
        concept: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: verificar permisos

      const newBrand = await db
        .insert(brands)
        .values({
          ...input,
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
        companiesId: z.set(z.string()),
        concept: z.string().optional(),
        razon_social: z.string().optional(),
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
          razon_social: input.razon_social,
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
        razon_social: z.string().optional(),
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
          razon_social: input.razon_social,
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
      await db.delete(schema.brands).where(eq(schema.brands.id, input.brandId));
      await db
        .delete(schema.companiesToBrands)
        .where(eq(schema.companiesToBrands.brandId, input.brandId));
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
