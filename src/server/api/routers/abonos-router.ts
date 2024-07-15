import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { and, eq } from "drizzle-orm";

export const abonosRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const abonos = await db.query.abonos.findMany({
      with: { family_group: { with: { businessUnitData: true } } },
    });
    return abonos.filter(
      (abono) =>
        abono.family_group?.businessUnitData?.companyId === ctx.session.orgId
    );
  }),
  get: protectedProcedure
    .input(
      z.object({
        abonoId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const abono = await db.query.abonos.findFirst({
        where: and(eq(schema.abonos.id, input.abonoId)),
        with: {
          family_group: {
            with: {
              businessUnitData: true,
            },
          },
        },
      });
      return abono;
    }),

  create: protectedProcedure
    .input(
      z.object({
        valor: z.number(),
        family_group: z.string().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const abono = await db.insert(schema.abonos).values({
        valor: input.valor,
        family_group: input.family_group,
      });

      return abono;
    }),

  update: protectedProcedure
    .input(
      z.object({
        valor: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const abono = await db.update(schema.abonos).set({
        valor: input.valor,
      });

      return abono;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        abonoId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const abono = await db
        .delete(schema.abonos)
        .where(eq(schema.abonos.id, input.abonoId));

      return abono;
    }),
});
