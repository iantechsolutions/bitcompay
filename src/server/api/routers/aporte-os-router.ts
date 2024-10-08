import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { aportes_os, healthInsurances } from "~/server/db/schema";
import { RouterOutputs } from "~/trpc/shared";

export const aportes_osRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const aportes_os = await db.query.aportes_os.findMany({});
    return aportes_os;
  }),
  get: protectedProcedure
    .input(
      z.object({
        aportes_osId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const aportes_os = await db.query.aportes_os.findFirst({
        where: eq(schema.aportes_os.id, input.aportes_osId),
      });

      return aportes_os;
    }),
  getByOS: protectedProcedure
    .input(
      z.object({
        healthInsurances_id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const aportes_os = await db.query.aportes_os.findMany({
        where: eq(
          schema.aportes_os.healthInsurances_id,
          input.healthInsurances_id
        ),
      });
      return aportes_os;
    }),
  create: protectedProcedure
    .input(
      z.object({
        id_affiliate: z.string(),
        cuil: z.string(),
        process_date: z.date(),
        contribution_date: z.date(),
        support_date: z.date(),
        amount: z.string(),
        emploter_document_number: z.string(),
        healthInsurances_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const affiliate = await db.insert(aportes_os).values(input).returning();

      return affiliate;
    }),
  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        id_affiliate: z.string(),
        cuil: z.string(),
        process_date: z.date(),
        contribution_date: z.date(),
        support_date: z.date(),
        amount: z.string(),
        emploter_document_number: z.string(),
        healthInsurances_id: z.string(),
      })
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedaportes_os = await db
        .update(schema.aportes_os)
        .set(input)
        .where(eq(schema.aportes_os.id, id));
      console.log(updatedaportes_os);
      return updatedaportes_os;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        aportes_osId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.aportes_os)
        .where(eq(schema.aportes_os.id, input.aportes_osId));
    }),
});

export type aportes_os = RouterOutputs["aportes_os"]["list"][number];
