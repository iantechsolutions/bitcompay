import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";

export const currentAccountRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const currentAccount = await db.query.currentAccount.findMany({
      with: { events: true },
    });
    return currentAccount;
  }),
  get: protectedProcedure
    .input(
      z.object({
        currentAccountId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const currentAccount = await db.query.currentAccount.findFirst({
        where: eq(schema.currentAccount.id, input.currentAccountId),
        with: { events: true },
      });

      return currentAccount;
    }),
  getByHealthInsurance: protectedProcedure
    .input(
      z.object({
        healthInsuranceId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const currentAccount = await db.query.currentAccount.findFirst({
        where: eq(
          schema.currentAccount.health_insurance,
          input.healthInsuranceId
        ),
        with: { events: true },
      });

      return currentAccount;
    }),
  getByFamilyGroup: protectedProcedure
    .input(
      z.object({
        familyGroupId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const currentAccount = await db.query.currentAccount.findFirst({
        where: eq(schema.currentAccount.family_group, input.familyGroupId),
        with: { events: true },
      });

      return currentAccount;
    }),
  create: protectedProcedure
    .input(
      z.object({
        company_id: z.string().nullable(),
        family_group: z.string().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const currentAccount = await db
        .insert(schema.currentAccount)
        .values({
          family_group: input.family_group,
          company_id: input.company_id,
        })
        .returning();

      return currentAccount;
    }),
  createInitial: protectedProcedure
    .input(
      z.object({
        company_id: z.string().nullable().optional(),
        family_group: z.string().nullable().optional(),
        healthInsurance: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      let currentAccount = null;
      if (input.family_group) {
        currentAccount = await db
          .insert(schema.currentAccount)
          .values({
            family_group: input.family_group,
            company_id: input.company_id,
          })
          .returning();
      } else if (input.healthInsurance) {
        currentAccount = await db
          .insert(schema.currentAccount)
          .values({
            health_insurance: input.healthInsurance,
            company_id: input.company_id,
          })
          .returning();
      } else {
        currentAccount = await db
          .insert(schema.currentAccount)
          .values({
            company_id: input.company_id,
          })
          .returning();
      }
      const firstEvent = await db.insert(schema.events).values({
        current_amount: 0,
        description: "Apertura",
        event_amount: 0,
        currentAccount_id: currentAccount[0]?.id,
        type: "REC",
      });
      return currentAccount;
    }),
  update: protectedProcedure
    .input(
      z.object({
        company_id: z.string().nullable(),
        family_group: z.string().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const currentAccount = await db.update(schema.currentAccount);

      return currentAccount;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        currentAccountId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const currentAccount = await db
        .delete(schema.currentAccount)
        .where(eq(schema.currentAccount.id, input.currentAccountId));

      return currentAccount;
    }),
});
