import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '~/server/db'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const healthInsurancesRouter = createTRPCRouter({
    get: protectedProcedure.input(z.object({ healthInsuranceId: z.string() })).query(async ({ input }) => {
        const healthInsurance_found = await db.query.healthInsurances.findFirst({
            where: eq(schema.healthInsurances.id, input.healthInsuranceId),
        })
        return healthInsurance_found
    }),
    list: protectedProcedure.query(async () => {
        const healthInsurances = await db.query.healthInsurances.findMany()
        return healthInsurances
    }),
    create: protectedProcedure.input(z.object({ name: z.string() })).mutation(async ({ input }) => {
        const new_healthInsurance = await db.insert(schema.healthInsurances).values({ name: input.name })
        return new_healthInsurance
    }),
    change: protectedProcedure
        .input(
            z.object({
                name: z.string(),
                healthInsuranceId: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            const healthInsurance_changed = await db
                .update(schema.healthInsurances)
                .set({ name: input.name })
                .where(eq(schema.healthInsurances.id, input.healthInsuranceId))
            return healthInsurance_changed
        }),
    delete: protectedProcedure.input(z.object({ healthInsuranceId: z.string() })).mutation(async ({ input }) => {
        const healthInsurance_deleted = await db
            .delete(schema.healthInsurances)
            .where(eq(schema.healthInsurances.id, input.healthInsuranceId))
        return healthInsurance_deleted
    }),
})
