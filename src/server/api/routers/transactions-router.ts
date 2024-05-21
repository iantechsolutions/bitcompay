import { db } from '~/server/db'
import { createTRPCRouter, protectedProcedure } from '../trpc'
export const transactionsRouter = createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await db.query.payments.findMany()
    }),
})
