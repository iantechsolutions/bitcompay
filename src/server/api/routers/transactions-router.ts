import { db } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import * as schema from "~/server/db/schema";
export const transactionsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.query.payments.findMany();
  }),
});
