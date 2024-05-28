import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db, schema } from '~/server/db'
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const bussinessUnitsRouter = createTRPCRouter({
    get: protectedProcedure.input(z.object({ bussinessUnitId: z.string() })).query(async ({ input }) => {
        const bussinessUnit_found = await db.query.bussinessUnits.findFirst({
            where: eq(schema.bussinessUnits.id, input.bussinessUnitId),
        })
        return bussinessUnit_found
    }),
  list: protectedProcedure.query(async () => {
    const bussinessUnits = await db.query.bussinessUnits.findMany();
    return bussinessUnits;
  }),
  create: protectedProcedure
    .input(
      z.object({
        description: z.string(),
        companyId: z.string(),
        brandId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const new_bussinessUnit = await db.insert(schema.bussinessUnits).values({
        brandId: input.brandId,
        description: input.description,
        companyId: input.companyId,
      });
      return new_bussinessUnit;
    }),
  change: protectedProcedure
    .input(
      z.object({
        bussinessUnitId: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const bussinessUnit_changed = await db
        .update(schema.bussinessUnits)
        .set({ description: input.description })
        .where(eq(schema.bussinessUnits.id, input.bussinessUnitId));
      return bussinessUnit_changed;
    }),
  delete: protectedProcedure
    .input(z.object({ bussinessUnitId: z.string() }))
    .mutation(async ({ input }) => {
      const bussinessUnit_deleted = await db
        .delete(schema.bussinessUnits)
        .where(eq(schema.bussinessUnits.id, input.bussinessUnitId));
      return bussinessUnit_deleted;
    }),
})
