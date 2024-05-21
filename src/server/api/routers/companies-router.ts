import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";
import { and, eq, inArray } from "drizzle-orm";

export const companiesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    return await db.query.companies.findMany();
  }),

  get: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const company = await db.query.companies.findFirst({
        where: eq(schema.companies.id, input.companyId),
        with: {
          products: {},
          brands: {
            columns: {
              companyId: false,
              brandId: false,
            },

            with: {
              brand: {
                columns: {
                  name: true,
                  id: true,
                },
              },
            },
          },
        },
      });
      return company;
    }),

  getRelated: protectedProcedure
    .input(
      z.object({
        brandId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      interface Company {
        id: string;
        name: string;
      }

      const allCompaniesToBrands = await db.query.companiesToBrands.findMany();

      const relatedCompanies = allCompaniesToBrands.filter(
        (company) => company.brandId == input.brandId,
      );

      const relatedCompaniesId = relatedCompanies.map(
        (company) => company.companyId,
      );

      const companies: (Company | undefined)[] = [];

      for (const companyId of relatedCompaniesId) {
        const currentCompany = await db.query.companies.findFirst({
          where: eq(schema.companies.id, companyId),
          columns: {
            id: true,
            name: true,
          },
        });

        if (currentCompany !== undefined) {
          companies.push(currentCompany);
        }
      }

      return companies;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().min(0).max(1023),
        concept: z.string().min(0).max(1023),
        afipKey: z.string().min(0).max(255).optional(),
        certificate: z.string().min(0).max(255).optional(),
        cuit: z.string().min(0).max(255).optional(),
        razon_social: z.string().min(0).max(255).optional(),
        
      }),
    )
    .mutation(async ({ input }) => {
      // TODO: verificar permisos

      const id = createId();

      await db.insert(schema.companies).values({
        id,
        name: input.name,
        description: input.description,
        concept: input.concept,
        afipKey: input.afipKey,
        certificate: input.certificate,
        cuit: input.cuit,
        razon_social: input.razon_social,
      });

      return { id };
    }),

  change: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().min(0).max(1023).optional(),
        afipKey: z.string().min(0).max(255).optional(),
        certificate: z.string().min(0).max(255).optional(),
        cuit: z.string().min(0).max(255).optional(),
        razon_social: z.string().min(0).max(255).optional(),
        products: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.transaction(async (db) => {
        await db
          .update(schema.companies)
          .set({
            name: input.name,
            description: input.description,
            afipKey: input.afipKey,
            certificate: input.certificate,
            cuit: input.cuit,
            razon_social: input.razon_social,
          })
          .where(eq(schema.companies.id, input.companyId));

        const companyProducts = await db.query.companyProducts.findMany({
          where: eq(schema.companyProducts.companyId, input.companyId),
        });

        if (input.products) {
          const products = new Set(input.products);

          const productsToDelete = companyProducts.filter((companyProduct) => {
            return !products.has(companyProduct.productId);
          });

          const productsToAdd = input.products.filter((productId) => {
            return !companyProducts.find(
              (companyProduct) => companyProduct.productId === productId,
            );
          });

          if (productsToDelete.length > 0) {
            await db.delete(schema.companyProducts).where(
              and(
                eq(schema.companyProducts.companyId, input.companyId),
                inArray(
                  schema.companyProducts.productId,
                  productsToDelete.map(
                    (companyProduct) => companyProduct.productId,
                  ),
                ),
              ),
            );
          }

          if (productsToAdd.length > 0) {
            await db.insert(schema.companyProducts).values(
              productsToAdd.map((productId) => ({
                companyId: input.companyId,
                productId,
              })),
            );
          }
        }
      });
    }),

  getByProduct: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ input }) => {
      const relations = await db.query.companyProducts.findMany({
        where: eq(schema.companyProducts.productId, input.productId),
      });
      const companies = [];

      for (const relation of relations) {
        const company = await db.query.companies.findFirst({
          where: eq(schema.companies.id, relation.companyId),
        });
        companies.push(company);
      }

      return companies;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        companyId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        await tx
          .delete(schema.companies)
          .where(eq(schema.companies.id, input.companyId));
        await tx
          .delete(schema.companyProducts)
          .where(eq(schema.companyProducts.companyId, input.companyId));
      });
      await db
        .delete(schema.companiesToBrands)
        .where(eq(schema.companiesToBrands.companyId, input.companyId));
    }),
});
