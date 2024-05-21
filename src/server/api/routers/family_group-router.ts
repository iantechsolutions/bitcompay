import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { administrative_audit, medical_audit, family_groups } from "~/server/db/schema";

export const family_groupsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const family_groups = await db.query.family_groups.findMany();
    return family_groups;
  }),
  get: protectedProcedure
    .input(
      z.object({
        family_groupsId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const family_groups = await db.query.family_groups.findFirst({
        where: eq(schema.family_groups.id, input.family_groupsId),
      });

      return family_groups;
    }),

  create: protectedProcedure
    .input(
      z.object({
        businessUnit: z.string(),
        validity: z.date(),
        plan: z.string(),
        modo: z.string(),
        receipt: z.string().optional(),
        bonus: z.string().optional(),
        procedureId: z.string().optional(),
        state:z.string().optional(),
        payment_status:z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const new_family_group = await db.insert(family_groups).values({
        ...input
      }).returning();
      return new_family_group;
    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        businessUnit: z.string(),
        validity: z.date(),
        plan: z.string(),
        modo: z.string(),
        receipt: z.string().optional(),
        bonus: z.string().optional(),
        procedureId: z.string().optional(),
        state:z.string().optional(),
        payment_status:z.string().optional(),
      }),
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedfamily_groups = await db
        .update(schema.family_groups)
        .set(input)
        .where(eq(schema.family_groups.id, id));
      console.log(updatedfamily_groups);
      return updatedfamily_groups;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        family_groupsId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.family_groups)
        .where(eq(schema.family_groups.id, input.family_groupsId));
    }),
});
