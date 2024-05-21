import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '~/server/db'
import { prospects } from '~/server/db/schema'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const prospectsRouter = createTRPCRouter({
    list: protectedProcedure.query(async ({}) => {
        const prospects = await db.query.prospects.findMany()
        return prospects
    }),
    get: protectedProcedure
        .input(
            z.object({
                prospectsId: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const prospects = await db.query.prospects.findFirst({
                where: eq(schema.prospects.id, input.prospectsId),
            })

            return prospects
        }),

    create: protectedProcedure
        .input(
            z.object({
                businessUnit: z.string(),
                validity: z.date(),
                plan: z.string(),
                modo: z.string(),
                cuit: z.string(),
                healthInsurances: z.string(),
                employerContribution: z.string(),
                receipt: z.string(),
                bonus: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            await db.insert(prospects).values(input)
        }),

    change: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                businessUnit: z.string(),
                validity: z.date(),
                plan: z.string(),
                modo: z.string(),
                cuit: z.string(),
                healthInsurances: z.string(),
                employerContribution: z.string(),
                receipt: z.string(),
                bonus: z.string(),
            }),
        )
        .mutation(async ({ input: { id, ...input } }) => {
            const updatedprospects = await db.update(schema.prospects).set(input).where(eq(schema.prospects.id, id))
            return updatedprospects
        }),

    delete: protectedProcedure
        .input(
            z.object({
                prospectsId: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            await db.delete(schema.prospects).where(eq(schema.prospects.id, input.prospectsId))
        }),
})
