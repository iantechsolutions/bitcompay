import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { currentUser } from "@clerk/nextjs/server";
import { RouterOutputs } from "~/trpc/shared";

export const plansRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .query(async ({ input }) => {
      const plan_found = await db.query.plans.findFirst({
        where: eq(schema.plans.id, input.planId),
        with: {
          pricesPerAge: true,
        },
      });
      return plan_found;
    }),
  list: protectedProcedure.query(async () => {
    const plans = await db.query.plans.findMany({
      with: {
        pricesPerAge: true,
      },
    });
    return plans;
  }),
  create: protectedProcedure
    .input(
      z.object({
        validy_date: z.date(),
        plan_code: z.string().max(255),
        description: z.string().max(255),
        brand_id: z.string().max(255),
      })
    )
    .mutation(async ({ input }) => {
      const user = await currentUser();
      const new_plan = await db
        .insert(schema.plans)
        .values({
          user: user?.id ?? "",
          validy_date: input.validy_date,
          plan_code: input.plan_code,
          description: input.description,
          brand_id: input.brand_id,
        })
        .returning();
      return new_plan;
    }),

  change: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        validy_date: z.date(),
        plan_code: z.string().max(255),
        description: z.string().max(255),
        brand_id: z.string().max(255),
      })
    )
    .mutation(async ({ input }) => {
      const modified_plan = await db
        .update(schema.plans)
        .set({
          validy_date: input.validy_date,
          plan_code: input.plan_code,
          description: input.description,
          brand_id: input.brand_id,
        })
        .where(eq(schema.plans.id, input.planId))
        .returning();
      return modified_plan;
    }),
  delete: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .mutation(async ({ input }) => {
      const deleted_plan = await db
        .delete(schema.plans)
        .where(eq(schema.plans.id, input.planId));
      return deleted_plan;
    }),
});

export type Plans = RouterOutputs["plans"]["list"][number];
