import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { affiliate_os, healthInsurances } from "~/server/db/schema";
import { RouterOutputs } from "~/trpc/shared";

export const affiliate_osRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const affiliate_os = await db.query.affiliate_os.findMany({});
    return affiliate_os;
  }),
  get: protectedProcedure
    .input(
      z.object({
        affiliate_osId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const affiliate_os = await db.query.affiliate_os.findFirst({
        where: eq(schema.affiliate_os.id, input.affiliate_osId),
      });

      return affiliate_os;
    }),
  //   getByGroup: protectedProcedure
  //     .input(
  //       z.object({
  //         family_group_id: z.string(),
  //       })
  //     )
  //     .query(async ({ input }) => {
  //       const affiliate_os = await db.query.affiliate_os.findMany({
  //         where: eq(schema.affiliate_os.family_group_id, input.family_group_id),
  //       });
  //       return affiliate_os;
  //     }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        cuil: z.string(),
        Periodo: z.date(),
        Total: z.string(),
        Aporte: z.string(),
        Contribucion: z.string(),
        Subsidio: z.string(),
        Monotributo: z.string(),
        Modalidad: z.string(),
        healthInsurances_id: z.string(),
        Otros: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const affiliate = await db.insert(affiliate_os).values(input).returning();

      return affiliate;
    }),
  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        iva: z.string(),
        name: z.string(),
        cuil: z.string(),
        periodo: z.date(),
        total: z.string(),
        aporte: z.string(),
        contribucion: z.string(),
        subsidio: z.string(),
        monotributo: z.string(),
        modalidad: z.string(),
        otros: z.string(),
        healthInsurances_id: z.string(),
      })
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedaffiliate_os = await db
        .update(schema.affiliate_os)
        .set(input)
        .where(eq(schema.affiliate_os.id, id));
      console.log(updatedaffiliate_os);
      return updatedaffiliate_os;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        affiliate_osId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.affiliate_os)
        .where(eq(schema.affiliate_os.id, input.affiliate_osId));
    }),
});

export type Affiliate_os = RouterOutputs["affiliate_os"]["list"][number];
