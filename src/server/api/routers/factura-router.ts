import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '~/server/db'
import { FacturasSchemaDB } from '~/server/db/schema'
import { createTRPCRouter, protectedProcedure } from '../trpc'
export const facturasRouter = createTRPCRouter({
    list: protectedProcedure.query(async ({}) => {
        const facturas = await db.query.facturas.findMany()
        return facturas
    }),
    get: protectedProcedure
        .input(
            z.object({
                providerId: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const provider = await db.query.facturas.findFirst({
                where: eq(schema.facturas.id, input.providerId),
            })

            return provider
        }),

    create: protectedProcedure.input(FacturasSchemaDB).mutation(async ({ input }) => {
        const newProvider = await db.insert(schema.facturas).values({ ...input })

        return newProvider
    }),

    change: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                ...FacturasSchemaDB.shape,
            }),
        )
        .mutation(async ({ input: { id, ...input } }) => {
            const updatedProvider = await db.update(schema.facturas).set(input).where(eq(schema.facturas.id, id))
            return updatedProvider
        }),

    delete: protectedProcedure
        .input(
            z.object({
                providerId: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            await db.delete(schema.facturas).where(eq(schema.facturas.id, input.providerId))
        }),
})
