import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import {
  administrative_audit,
  medical_audit,
  family_groups,
} from "~/server/db/schema";

export const family_groupsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const family_groups = await db.query.family_groups.findMany({
      with: { integrants: true, cc: true },
    });
    return family_groups;
  }),
  get: protectedProcedure
    .input(
      z.object({
        family_groupsId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const family_groups = await db.query.family_groups.findFirst({
        where: eq(schema.family_groups.id, input.family_groupsId),
      });

      return family_groups;
    }),
  getbyProcedure: protectedProcedure
    .input(
      z.object({
        procedureId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const family_group = await db.query.family_groups.findFirst({
        where: eq(schema.family_groups.procedureId, input.procedureId),
      });
      return family_group;
    }),
  getByBrand: protectedProcedure
    .input(
      z.object({
        brandId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const family_group = await db.query.family_groups.findMany({
        with: {
          businessUnitData: true,
          abonos: true,
          integrants: {
            with: {
              contribution: true,
              differentialsValues: true,
            },
          },
          bonus: true,
          plan: true,
          modo: true,
        },
      });
      const family_group_reduced = family_group.filter((family_group) => {
        return family_group.businessUnitData?.brandId === input.brandId;
      });
      return family_group_reduced;
    }),
  getByOrganization: protectedProcedure.query(async ({ ctx }) => {
    const companyId = ctx.session.orgId;

    const family_group = await db.query.family_groups.findMany({
      with: {
        businessUnitData: true,
        abonos: true,
        integrants: {
          with: {
            contribution: true,
            differentialsValues: true,
          },
        },
        bonus: true,
        plan: true,
        modo: true,
      },
    });
    const family_group_reduced = family_group.filter((family_group) => {
      return family_group.businessUnitData?.companyId === companyId!;
    });
    return family_group_reduced;
  }),
  create: protectedProcedure
    .input(
      z.object({
        businessUnit: z.string().optional(), // optional() solo con motivos de testing
        validity: z.date(),
        plan: z.string(),
        modo: z.string(),
        receipt: z.string().optional(),
        bonus: z.string().optional(),
        procedureId: z.string().optional(),
        state: z.string().optional(),
        payment_status: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const new_family_group = await db
        .insert(family_groups)
        .values({
          ...input,
        })
        .returning();
      return new_family_group;
    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        businessUnit: z.string().nullable(),
        validity: z.date().nullable(),
        plan: z.string().nullable(),
        modo: z.string().nullable(),
        receipt: z.string().nullable().optional(),
        bonus: z.string().nullable().optional(),
        procedureId: z.string().nullable().optional(),
        state: z.string().nullable().optional(),
        payment_status: z.string().nullable().optional(),
      })
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
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.family_groups)
        .where(eq(schema.family_groups.id, input.family_groupsId));
    }),
});
