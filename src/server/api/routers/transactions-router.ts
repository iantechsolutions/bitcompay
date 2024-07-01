import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { eq } from "drizzle-orm";
export const transactionsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.query.payments.findMany({
      where: eq(schema.payments.companyId, ctx.session.orgId!),
    });
  }),
});
