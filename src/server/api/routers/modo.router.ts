import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '~/server/db'
import { modos } from '~/server/db/schema'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const modosRouter = createTRPCRouter({
    list: protectedProcedure.query(async ({}) => {
        const modos = await db.query.modos.findMany()
        return modos
    }),
    get: protectedProcedure
        .input(
            z.object({
                modosId: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const modos = await db.query.modos.findFirst({
                where: eq(schema.modos.id, input.modosId),
            })

            return modos
        }),

    create: protectedProcedure
        .input(
            z.object({
                description: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            await db.insert(modos).values(input)
        }),
    change: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                description: z.string(),
            }),
        )
        .mutation(async ({ input: { id, ...input } }) => {
            const updatedmodos = await db.update(schema.modos).set(input).where(eq(schema.modos.id, id))
            return updatedmodos
        }),

    delete: protectedProcedure
        .input(
            z.object({
                modosId: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            await db.delete(schema.modos).where(eq(schema.modos.id, input.modosId))
        }),
})
