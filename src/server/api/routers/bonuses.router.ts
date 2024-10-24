import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";

import { bonusesSchemaDB } from "~/server/db/schema";
import { currentUser } from "@clerk/nextjs/server";

export const bonusesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const bonuses = await db.query.bonuses.findMany({
      with: { family_group: { with: { businessUnitData: true } } },
    });
    return bonuses.filter(
      (bonus) =>
        bonus.family_group?.businessUnitData?.companyId === ctx.session.orgId
    );
  }),
  get: protectedProcedure
    .input(
      z.object({
        bonusesId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const bonuses = await db.query.bonuses.findFirst({
        where: eq(schema.bonuses.id, input.bonusesId),
      });

      return bonuses;
    }),

  create: protectedProcedure
    .input(bonusesSchemaDB)
    .mutation(async ({ input }) => {
      const user = await currentUser();

      const newbonuses = await db.insert(schema.bonuses).values({
        appliedUser: user?.id ?? "",
        approverUser: user?.id ?? "",
        validationDate: input.validationDate,
        duration: input.duration,
        amount: input.amount,
        reason: input.reason,
        from: input.from,
        to: input.to,
        family_group_id: input.family_group_id,
      });

      return newbonuses;
    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...bonusesSchemaDB.shape,
      })
    )
    .mutation(async ({ input: { id, ...input } }) => {
      const user = await currentUser();

      const updatedbonuses = await db
        .update(schema.bonuses)
        .set({
          appliedUser: user?.id ?? "",
          approverUser: user?.id ?? "",
          validationDate: input.validationDate,
          duration: input.duration,
          amount: input.amount,
          reason: input.reason,
          from: input.from,
          to: input.to,
          family_group_id: input.family_group_id,
        })
        .where(eq(schema.bonuses.id, id));
      console.log(updatedbonuses);
      return updatedbonuses;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        bonusesId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.bonuses)
        .where(eq(schema.bonuses.id, input.bonusesId));
    }),
});
