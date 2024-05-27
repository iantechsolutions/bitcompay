import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";

export const contributionsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const contributions = await db.query.contributions.findMany();
    return contributions;
  }),
  get: protectedProcedure
    .input(
      z.object({
        contributionId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const contribution = await db.query.contributions.findFirst({
        where: eq(schema.contributions.id, input.contributionId),
      });

      return contribution;
    }),

  getByIntegrant: protectedProcedure
    .input(
      z.object({
        integrantId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const contributions = await db.query.contributions.findMany({
        where: eq(schema.contributions.integrant_id, input.integrantId),
      });

      return contributions;
    }),
  create: protectedProcedure
    .input(
      z.object({
        integrant_id: z.string(),
        amount: z.number(),
        employerContribution: z.number(),
        employeeContribution: z.number(),
        cuitEmployer: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const contribution = await db.insert(schema.contributions).values({
        integrant_id: input.integrant_id,
        amount: input.amount,
        employerContribution: input.employerContribution,
        employeeContribution: input.employeeContribution,
        cuitEmployer: input.cuitEmployer,
      });

      return contribution;
    }),

  update: protectedProcedure
    .input(
      z.object({
        contributionId: z.string(),
        amount: z.number(),
        employerContribution: z.number(),
        employeeContribution: z.number(),
        cuitEmployer: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const contribution = await db
        .update(schema.contributions)
        .set({
          amount: input.amount,
          employerContribution: input.employerContribution,
          employeeContribution: input.employeeContribution,
          cuitEmployer: input.cuitEmployer,
        })
        .where(eq(schema.contributions.id, input.contributionId));

      return contribution;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        contributionId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const contribution = await db
        .delete(schema.contributions)
        .where(eq(schema.contributions.id, input.contributionId));

      return contribution;
    }),
});
