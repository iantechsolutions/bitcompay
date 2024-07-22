import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { createId } from "~/lib/utils";
import { db, DBTX, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { CarTaxiFront } from "lucide-react";

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
        products: {
          with: {
            product: true,
          },
        },
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
    .mutation(async ({ input, ctx }) => {
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

      await db.insert(schema.currentAccount).values({
        company_id: company[0]?.id,
        id: company[0]?.id,
      });

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
        // borro las mas simples
        await deleteBasics(tx, input.companyId);

        // borro productos

        await tx
          .delete(schema.companyProducts)
          .where(eq(schema.companyProducts.companyId, input.companyId));

        // borro circuito de procedure,medical/admin audit, family_groups, (integrants, bonus, abonos)
        const procedures = await tx.query.procedure.findMany({
          where: eq(schema.procedure.companyId, input.companyId),
        });
        console.log("procedures", procedures);
        if (procedures.length === 0) {
          console.log("no hay procedures");
          await tx
            .delete(schema.bussinessUnits)
            .where(eq(schema.bussinessUnits.companyId, input.companyId));
          await tx
            .delete(schema.documentUploads)
            .where(eq(schema.documentUploads.companyId, input.companyId));
          await tx
            .delete(schema.excelBilling)
            .where(eq(schema.excelBilling.companyId, input.companyId));
          await tx
            .delete(schema.healthInsurances)
            .where(eq(schema.healthInsurances.companyId, input.companyId));
          await tx
            .delete(schema.companies)
            .where(eq(schema.companies.id, input.companyId));
          return null;
        }
        await tx.delete(schema.medical_audit).where(
          inArray(
            schema.medical_audit.procedure_id,
            procedures.map((p) => p.id)
          )
        );
        await tx.delete(schema.administrative_audit).where(
          inArray(
            schema.administrative_audit.procedure_id,
            procedures.map((p) => p.id)
          )
        );

        const family_groups = await tx.query.family_groups.findMany({
          where: inArray(
            schema.family_groups.procedureId,
            procedures.map((p) => p.id)
          ),
        });

        if (family_groups.length === 0) {
          await tx
            .delete(schema.procedure)
            .where(eq(schema.procedure.companyId, input.companyId));
          await tx
            .delete(schema.bussinessUnits)
            .where(eq(schema.bussinessUnits.companyId, input.companyId));
          await tx
            .delete(schema.documentUploads)
            .where(eq(schema.documentUploads.companyId, input.companyId));
          await tx
            .delete(schema.excelBilling)
            .where(eq(schema.excelBilling.companyId, input.companyId));
          await tx
            .delete(schema.healthInsurances)
            .where(eq(schema.healthInsurances.companyId, input.companyId));
          await tx
            .delete(schema.companies)
            .where(eq(schema.companies.id, input.companyId));
          return null;
        }
        const integrants = await tx.query.integrants.findMany({
          where: inArray(
            schema.integrants.family_group_id,
            family_groups.map((fg) => fg.id)
          ),
        });
        if (integrants.length > 0) {
          await tx.delete(schema.contributions).where(
            inArray(
              schema.contributions.integrant_id,
              integrants.map((i) => i.id)
            )
          );
          await tx.delete(schema.differentialsValues).where(
            inArray(
              schema.differentialsValues.integrant_id,
              integrants.map((i) => i.id)
            )
          );
          await tx.delete(schema.pa).where(
            inArray(
              schema.pa.integrant_id,
              integrants.map((i) => i.id)
            )
          );
        }
        await tx.delete(schema.integrants).where(
          inArray(
            schema.integrants.family_group_id,
            family_groups.map((fg) => fg.id)
          )
        );
        await tx.delete(schema.bonuses).where(
          inArray(
            schema.bonuses.family_group_id,
            family_groups.map((fg) => fg.id)
          )
        );
        await tx.delete(schema.abonos).where(
          inArray(
            schema.abonos.family_group,
            family_groups.map((fg) => fg.id)
          )
        );
        await deleteComprobantesCircuit(tx, input.companyId);

        await tx.delete(schema.family_groups).where(
          inArray(
            schema.family_groups.procedureId,
            procedures.map((p) => p.id)
          )
        );
        await tx
          .delete(schema.procedure)
          .where(eq(schema.procedure.companyId, input.companyId));
        //borro las marcas
        const companiesToBrands = await tx.query.companiesToBrands.findMany({
          where: eq(schema.companiesToBrands.companyId, input.companyId),
        });
        if (companiesToBrands.length > 0) {
          const brands = await tx.query.brands.findMany({
            where: inArray(
              schema.brands.id,
              companiesToBrands.map((cp) => cp.brandId)
            ),
          });
          const plans = await tx.query.plans.findMany({
            where: inArray(
              schema.plans.brand_id,
              brands.map((brands) => brands.id)
            ),
          });
          if (plans.length > 0) {
            await tx.delete(schema.pricePerCondition).where(
              inArray(
                schema.pricePerCondition.plan_id,
                plans.map((p) => p.id)
              )
            );
          }
          await tx.delete(schema.plans).where(
            inArray(
              schema.plans.brand_id,
              brands.map((b) => b.id)
            )
          );
          await tx.delete(schema.brands).where(
            inArray(
              schema.brands.id,
              companiesToBrands.map((cp) => cp.brandId)
            )
          );
          await tx
            .delete(schema.companiesToBrands)
            .where(eq(schema.companiesToBrands.companyId, input.companyId));
        }

        await tx
          .delete(schema.healthInsurances)
          .where(eq(schema.healthInsurances.companyId, input.companyId));
        // al final de todo si borrar la compañia
        await tx
          .delete(schema.documentUploads)
          .where(eq(schema.documentUploads.companyId, input.companyId));
        await tx
          .delete(schema.companies)
          .where(eq(schema.companies.id, input.companyId));
      });
    }),
});

async function deleteBasics(db: DBTX, companyId: string) {
  await db.transaction(async (tx) => {
    const deleted_billing = await tx
      .delete(schema.excelBilling)
      .where(eq(schema.excelBilling.companyId, companyId))
      .returning();
    console.log("deleted_billing", deleted_billing);
    await tx
      .delete(schema.payments)
      .where(eq(schema.payments.companyId, companyId));
    await tx
      .delete(schema.documentUploads)
      .where(eq(schema.documentUploads.companyId, companyId));
    const current_accounts = await tx.query.currentAccount.findMany({
      where: eq(schema.currentAccount.company_id, companyId),
    });
    if (current_accounts.length > 0) {
      await tx.delete(schema.events).where(
        inArray(
          schema.events.currentAccount_id,
          current_accounts.map((ca) => ca.id)
        )
      );
      await tx
        .delete(schema.currentAccount)
        .where(eq(schema.currentAccount.company_id, companyId));
    }
  });
}

async function deleteComprobantesCircuit(db: DBTX, companyId: string) {
  console.log("llego aqui 1");
  await db.transaction(async (tx) => {
    // borro circuito de bu, liquidaciones, facturas e items
    console.log("llego aqui 2");
    const bussinessUnits = await tx.query.bussinessUnits.findMany({
      where: eq(schema.bussinessUnits.companyId, companyId),
    });
    console.log("businessUnits", bussinessUnits);
    if (bussinessUnits.length === 0) {
      return null;
    }
    const liquidations = await tx.query.liquidations.findMany({
      where: inArray(
        schema.liquidations.bussinessUnits_id,
        bussinessUnits.map((bu) => bu.id)
      ),
    });
    console.log(liquidations);
    if (liquidations.length === 0) {
      await tx
        .delete(schema.bussinessUnits)
        .where(eq(schema.bussinessUnits.companyId, companyId));

      return null;
    }
    const comprobantes = await tx.query.comprobantes.findMany({
      where: inArray(
        schema.comprobantes.liquidation_id,
        liquidations.map((l) => l.id)
      ),
    });
    console.log(comprobantes);
    if (comprobantes.length === 0) {
      await tx.delete(schema.liquidations).where(
        inArray(
          schema.liquidations.bussinessUnits_id,
          bussinessUnits.map((bu) => bu.id)
        )
      );
      await tx
        .delete(schema.bussinessUnits)
        .where(eq(schema.bussinessUnits.companyId, companyId));

      return null;
    }
    await tx.delete(schema.items).where(
      inArray(
        schema.items.comprobante_id,
        comprobantes.map((f) => f.id)
      )
    );
    await tx.delete(schema.comprobantes).where(
      inArray(
        schema.comprobantes.liquidation_id,
        liquidations.map((l) => l.id)
      )
    );
    await tx.delete(schema.liquidations).where(
      inArray(
        schema.liquidations.bussinessUnits_id,
        bussinessUnits.map((bu) => bu.id)
      )
    );
    await tx
      .delete(schema.bussinessUnits)
      .where(eq(schema.bussinessUnits.companyId, companyId));
  });
}
