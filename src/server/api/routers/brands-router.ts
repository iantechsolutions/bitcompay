import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { createId } from '~/lib/utils'
import { db, schema } from '~/server/db'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const brandsRouter = createTRPCRouter({
    get: protectedProcedure
        .input(
            z.object({
                brandId: z.string(),
            }),
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
            })

            return brand
        }),

    list: protectedProcedure.query(async () => {
        return await db.query.brands.findMany()
    }),
    getbyCompany: protectedProcedure
        .input(
            z.object({
                companyId: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const relations = await db.query.companiesToBrands.findMany({
                where: eq(schema.companiesToBrands.companyId, input.companyId),
            })
            const brands = []
            for (const relation of relations) {
                const brand = await db.query.brands.findFirst({
                    where: eq(schema.brands.id, relation.brandId),
                })
                brands.push(brand)
            }
            return brands
        }),
    create: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1).max(255),
                number: z.number().min(1).max(255),
                description: z.string().min(0).max(1023),
                redescription: z.string().min(0).max(10),
            }),
        )
        .mutation(async ({ input }) => {
            // TODO: verificar permisos

            const id = createId()

            await db.insert(schema.brands).values({
                id,
                name: input.name,
                description: input.description,
                redescription: input.redescription,
                companyId: null,
                number: input.number,
            })

            return { id }
        }),

    change: protectedProcedure
        .input(
            z.object({
                brandId: z.string(),
                name: z.string().min(1).max(255),
                description: z.string().min(0).max(1023).optional(),
                reducedDescription: z.string().min(0).max(10).optional(),
                companiesId: z.set(z.string()),
            }),
        )
        .mutation(async ({ input }) => {
            await db
                .update(schema.brands)
                .set({
                    name: input.name,
                    description: input.description,
                    redescription: input.reducedDescription,
                })
                .where(eq(schema.brands.id, input.brandId))

            await db.delete(schema.companiesToBrands).where(eq(schema.companiesToBrands.brandId, input.brandId))
            for (const companyId of input.companiesId) {
                await db.insert(schema.companiesToBrands).values({ brandId: input.brandId, companyId: companyId })
            }
        }),

    delete: protectedProcedure
        .input(
            z.object({
                brandId: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            await db.delete(schema.brands).where(eq(schema.brands.id, input.brandId))
            await db.delete(schema.companiesToBrands).where(eq(schema.companiesToBrands.brandId, input.brandId))
        }),

    addRelation: protectedProcedure.input(z.object({ companyId: z.string(), brandId: z.string() })).mutation(async ({ input }) => {
        await db.insert(schema.companiesToBrands).values({ brandId: input.brandId, companyId: input.companyId })
    }),

    deleteRelation: protectedProcedure.input(z.object({ companyId: z.string(), brandId: z.string() })).mutation(async ({ input }) => {
        await db
            .delete(schema.companiesToBrands)
            .where(and(eq(schema.companiesToBrands.companyId, input.companyId), eq(schema.companiesToBrands.brandId, input.brandId)))
    }),
})
