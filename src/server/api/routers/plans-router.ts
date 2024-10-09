import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { currentUser } from "@clerk/nextjs/server";
import { RouterOutputs } from "~/trpc/shared";

export const plansRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ planId: z.string() }))
    .query(async ({ input, ctx }) => {
      const plan_found = await db.query.plans.findFirst({
        where: eq(schema.plans.id, input.planId),
        with: {
          pricesPerCondition: true,
          brands: {
            with: {
              company: true,
            },
          },
        },
      });

      if (
        plan_found?.brands?.company.some(
          (company) => company.companyId === ctx.session.orgId
        )
      ) {
        return plan_found;
      } else {
        return null;
      }
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    const plans = await db.query.plans.findMany({
      with: {
        pricesPerCondition: true,
        brands: {
          with: {
            company: true,
          },
        },
      },
      where: eq(schema.plans.companies_id, ctx.session.orgId ?? ""),
    });

    return plans.length > 0 ? plans : [];
  }),
  getByBrand: protectedProcedure
    .input(z.object({ brandId: z.string() }))
    .query(async ({ input }) => {
      const planes = await db.query.plans.findMany({
        where: eq(schema.plans.brand_id, input.brandId),
        with: { pricesPerCondition: true },
      });

      return planes.length > 0 ? planes : [];
    }),
  create: protectedProcedure
    .input(
      z.object({
        plan_code: z.string().max(255),
        description: z.string().max(255),
        brand_id: z.string().max(255),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await currentUser();
      const new_plan = await db
        .insert(schema.plans)
        .values({
          user: user?.id ?? "",
          plan_code: input.plan_code,
          description: input.description,
          brand_id: input.brand_id,
          companies_id: ctx.session.orgId,
        })
        .returning();
      return new_plan;
    }),

  change: protectedProcedure
    .input(
      z.object({
        planId: z.string(),
        plan_code: z.string().max(255),
        description: z.string().max(255),
        brand_id: z.string().max(255),
      })
    )
    .mutation(async ({ input }) => {
      const modified_plan = await db
        .update(schema.plans)
        .set({
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
      const delete_price = await db
        .delete(schema.pricePerCondition)
        .where(eq(schema.pricePerCondition.plan_id, input.planId));

      const deleted_plan = await db
        .delete(schema.plans)
        .where(eq(schema.plans.id, input.planId));
      return deleted_plan;
    }),
});

export type Plans = RouterOutputs["plans"]["list"][number];
