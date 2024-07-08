import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { createId } from "~/lib/utils";
import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const companiesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    return await db.query.companies.findMany();
  }),
  getById: protectedProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ input }) => {
      const company_found = await db.query.companies.findFirst({
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
      return company_found;
    }),
  get: protectedProcedure.query(async ({ input, ctx }) => {
    const companyId = ctx.session.orgId;
    if (!companyId) return null;
    const company = await db.query.companies.findFirst({
      where: eq(schema.companies.id, companyId!),
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
      })
    )
    .query(async ({ input }) => {
      interface Company {
        id: string;
        name: string;
      }

      const allCompaniesToBrands = await db.query.companiesToBrands.findMany();

      const relatedCompanies = allCompaniesToBrands.filter(
        (company) => company.brandId === input.brandId
      );

      const relatedCompaniesId = relatedCompanies.map(
        (company) => company.companyId
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
        id: z.string(),
        name: z.string().min(1).max(255),
        description: z.string().min(0).max(1023),
        concept: z.string().min(0).max(1023),
        afipKey: z.string().min(0).max(255).optional(),
        certificate: z.string().min(0).max(255).optional(),
        cuit: z.string().min(0).max(255).optional(),
        razon_social: z.string().min(0).max(255).optional(),
        afip_condition: z.string().min(0).max(255).optional(),
        activity_start_date: z.date().optional(),
        address: z.string().min(0).max(255).optional(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: verificar permisos

      const company = await db
        .insert(schema.companies)
        .values({
          id: input.id,
          name: input.name,
          description: input.description,
          concept: input.concept,
          afipKey: input.afipKey,
          certificate: input.certificate,
          cuit: input.cuit,
          razon_social: input.razon_social,
          afip_condition: input.afip_condition,
          activity_start_date: input.activity_start_date,
          address: input.address,
        })
        .returning();

      return company[0]?.id;
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
        afip_condition: z.string().min(0).max(255).optional(),
        activity_start_date: z.date().optional(),
        address: z.string().min(0).max(255).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const companyId = ctx.session.orgId;
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
            afip_condition: input.afip_condition,
            activity_start_date: input.activity_start_date,
            address: input.address,
          })
          .where(eq(schema.companies.id, companyId!));

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
              (companyProduct) => companyProduct.productId === productId
            );
          });

          if (productsToDelete.length > 0) {
            await db.delete(schema.companyProducts).where(
              and(
                eq(schema.companyProducts.companyId, input.companyId),
                inArray(
                  schema.companyProducts.productId,
                  productsToDelete.map(
                    (companyProduct) => companyProduct.productId
                  )
                )
              )
            );
          }

          if (productsToAdd.length > 0) {
            await db.insert(schema.companyProducts).values(
              productsToAdd.map((productId) => ({
                companyId: companyId!,
                productId,
              }))
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.transaction(async (tx) => {
        const deleted_bu = await tx
          .delete(schema.bussinessUnits)
          .where(eq(schema.bussinessUnits.companyId, input.companyId))
          .returning();

        const deleted_ls = await tx
          .delete(schema.liquidations)
          .where(
            inArray(
              schema.liquidations.bussinessUnits_id,
              deleted_bu.map((bu) => bu.id).length > 0
                ? deleted_bu.map((bu) => bu.id)
                : [createId()]
            )
          )
          .returning();

        const deleted_facturas = await tx
          .delete(schema.facturas)
          .where(
            inArray(
              schema.facturas.liquidation_id,
              deleted_ls.map((ls) => ls.id).length > 0
                ? deleted_ls.map((ls) => ls.id)
                : [createId()]
            )
          )
          .returning();

        await tx
          .delete(schema.items)
          .where(
            inArray(
              schema.items.comprobante_id,
              deleted_facturas.map((f) => f.id).length > 0
                ? deleted_facturas.map((f) => f.id)
                : [createId()]
            )
          )
          .returning();

        await tx
          .delete(schema.healthInsurances)
          .where(eq(schema.healthInsurances.companyId, input.companyId));

        const deleted_procedures = await tx
          .delete(schema.procedure)
          .where(eq(schema.procedure.companyId, input.companyId))
          .returning();

        const deleted_fg = await tx
          .delete(schema.family_groups)
          .where(
            inArray(
              schema.family_groups.procedureId,
              deleted_procedures.map((p) => p.id).length > 0
                ? deleted_procedures.map((p) => p.id)
                : [createId()]
            )
          )
          .returning();

        await tx
          .delete(schema.abonos)
          .where(
            inArray(
              schema.abonos.family_group,
              deleted_fg.map((fg) => fg.id).length > 0
                ? deleted_fg.map((fg) => fg.id)
                : [createId()]
            )
          );

        const deleted_integrants = await tx
          .delete(schema.integrants)
          .where(
            inArray(
              schema.integrants.family_group_id,
              deleted_fg.map((fg) => fg.id).length > 0
                ? deleted_fg.map((fg) => fg.id)
                : [createId()]
            )
          )
          .returning();

        await tx
          .delete(schema.pa)
          .where(
            inArray(
              schema.pa.integrant_id,
              deleted_integrants.map((i) => i.id).length > 0
                ? deleted_integrants.map((i) => i.id)
                : [createId()]
            )
          );

        await tx
          .delete(schema.differentialsValues)
          .where(
            inArray(
              schema.differentialsValues.integrant_id,
              deleted_integrants.map((i) => i.id).length > 0
                ? deleted_integrants.map((i) => i.id)
                : [createId()]
            )
          );

        await tx
          .delete(schema.medical_audit)
          .where(
            inArray(
              schema.medical_audit.procedure_id,
              deleted_procedures.map((p) => p.id).length > 0
                ? deleted_procedures.map((p) => p.id)
                : [createId()]
            )
          );

        await tx
          .delete(schema.administrative_audit)
          .where(
            inArray(
              schema.administrative_audit.procedure_id,
              deleted_procedures.map((p) => p.id).length > 0
                ? deleted_procedures.map((p) => p.id)
                : [createId()]
            )
          );

        await tx
          .delete(schema.excelBilling)
          .where(eq(schema.excelBilling.companyId, input.companyId));

        await tx
          .delete(schema.currentAccount)
          .where(eq(schema.currentAccount.company_id, input.companyId));

        await tx
          .delete(schema.documentUploads)
          .where(eq(schema.documentUploads.companyId, input.companyId));

        await tx
          .delete(schema.payments)
          .where(eq(schema.payments.companyId, input.companyId));

        await tx
          .delete(schema.companies)
          .where(eq(schema.companies.id, input.companyId));

        await tx
          .delete(schema.companyProducts)
          .where(eq(schema.companyProducts.companyId, input.companyId!));

        await db
          .delete(schema.companiesToBrands)
          .where(eq(schema.companiesToBrands.companyId, input.companyId!));

        await tx
          .delete(schema.items)
          .where(
            inArray(
              schema.items.comprobante_id,
              deleted_facturas.map((f) => f.id)
            )
          )
          .returning();

        await tx
          .delete(schema.healthInsurances)
          .where(eq(schema.healthInsurances.companyId, input.companyId));

        await tx.delete(schema.abonos).where(
          inArray(
            schema.abonos.family_group,
            deleted_fg.map((fg) => fg.id)
          )
        );

        await tx.delete(schema.pa).where(
          inArray(
            schema.pa.integrant_id,
            deleted_integrants.map((i) => i.id)
          )
        );
        await tx.delete(schema.differentialsValues).where(
          inArray(
            schema.differentialsValues.integrant_id,
            deleted_integrants.map((i) => i.id)
          )
        );
        await tx.delete(schema.medical_audit).where(
          inArray(
            schema.medical_audit.procedure_id,
            deleted_procedures.map((p) => p.id)
          )
        );
        await tx.delete(schema.administrative_audit).where(
          inArray(
            schema.administrative_audit.procedure_id,
            deleted_procedures.map((p) => p.id)
          )
        );
        await tx
          .delete(schema.excelBilling)
          .where(eq(schema.excelBilling.companyId, input.companyId));
        await tx
          .delete(schema.currentAccount)
          .where(eq(schema.currentAccount.company_id, input.companyId));
        await tx
          .delete(schema.documentUploads)
          .where(eq(schema.documentUploads.companyId, input.companyId));
        await tx
          .delete(schema.payments)
          .where(eq(schema.payments.companyId, input.companyId));
        await tx
          .delete(schema.companies)
          .where(eq(schema.companies.id, input.companyId));
        await tx
          .delete(schema.companyProducts)
          .where(eq(schema.companyProducts.companyId, input.companyId!));
        await db
          .delete(schema.companiesToBrands)
          .where(eq(schema.companiesToBrands.companyId, input.companyId!));
      });
    }),
});
