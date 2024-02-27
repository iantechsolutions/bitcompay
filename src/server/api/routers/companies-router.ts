import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";
import { and, eq, inArray } from "drizzle-orm";

export const companiesRouter = createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await db.query.companies.findMany()
    }),

    get: protectedProcedure.input(z.object({
        companyId: z.string(),
    })).query(async ({ input }) => {
        const company = await db.query.companies.findFirst({
            where: eq(schema.companies.id, input.companyId),
            with: {
                products: {},
            }
        })

        return company
    }),

    create: protectedProcedure.input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().min(0).max(1023),
    })).mutation(async ({ ctx, input }) => {
        // TODO: verificar permisos

        const id = createId()

        await db.insert(schema.companies).values({
            id,
            name: input.name,
            description: input.description,
        })

        return { id }
    }),

    change: protectedProcedure.input(z.object({
        companyId: z.string(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().min(0).max(1023).optional(),
        products: z.array(z.string()).optional(),
    })).mutation(async ({ ctx, input }) => {

        await db.transaction(async db => {
            await db.update(schema.companies).set({
                name: input.name,
                description: input.description,
            }).where(eq(schema.companies.id, input.companyId))

            const companyProducts = await db.query.companyProducts.findMany({
                where: eq(schema.companyProducts.companyId, input.companyId)
            })

            if (input.products) {
                const products = new Set(input.products)

                const productsToDelete = companyProducts.filter(companyProduct => {
                    return !products.has(companyProduct.productId)
                })

                const productsToAdd = input.products.filter(productId => {
                    return !companyProducts.find(companyProduct => companyProduct.productId === productId)
                })


                if (productsToDelete.length > 0) {
                    await db.delete(schema.companyProducts).where(and(
                        eq(schema.companyProducts.companyId, input.companyId),
                        inArray(schema.companyProducts.productId, productsToDelete.map(companyProduct => companyProduct.productId))
                    ))
                }

                if (productsToAdd.length > 0) {
                    await db.insert(schema.companyProducts).values(productsToAdd.map(productId => ({
                        companyId: input.companyId,
                        productId,
                    })))
                }
            }
        })
    }),

    delete: protectedProcedure.input(z.object({
        companyId: z.string(),
    })).mutation(async ({ ctx, input }) => {
        await db.transaction(async tx => {
            await tx.delete(schema.companies).where(eq(schema.companies.id, input.companyId))
            await tx.delete(schema.companyProducts).where(eq(schema.companyProducts.companyId, input.companyId))
        })
    }),
})
