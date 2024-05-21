import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '~/server/db'
import { createTRPCRouter, protectedProcedure } from '../trpc'
// a partir de ahora
export const statusRouter = createTRPCRouter({
    list: protectedProcedure.query(async () => {
        const status = await db.query.paymentStatus.findMany()
        return status
    }),
    get: protectedProcedure.input(z.object({ statusId: z.string() })).query(async ({ input }) => {
        const status_found = await db.query.paymentStatus.findFirst({
            where: eq(schema.paymentStatus.code, input.statusId),
        })
        return status_found
    }),
    create: protectedProcedure.input(z.object({ description: z.string(), code: z.string() })).mutation(async ({ input }) => {
        const new_status = await db.insert(schema.paymentStatus).values({ code: input.code, description: input.description })
        return new_status
    }),
    change: protectedProcedure
        .input(
            z.object({
                description: z.string(),
                code: z.string(),
                statusId: z.string(),
            }),
        )
        .mutation(async ({ input }) => {
            const modified_status = await db
                .update(schema.paymentStatus)
                .set({ description: input.description, code: input.code })
                .where(eq(schema.paymentStatus.id, input.statusId))
            return modified_status
        }),
    delete: protectedProcedure.input(z.object({ statusId: z.string() })).mutation(async ({ input }) => {
        const deleted_status = await db.delete(schema.paymentStatus).where(eq(schema.paymentStatus.id, input.statusId))
        return deleted_status
    }),
})
