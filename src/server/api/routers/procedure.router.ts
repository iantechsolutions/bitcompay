import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { and, eq } from "drizzle-orm";

export const procedureRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const procedures = await db.query.procedure.findMany({
      where: eq(schema.procedure.companyId, ctx.session.orgId!),
      with: {
        administrative_audits: true,
        medical_audits: true,
      },
    });
    return procedures;
  }),
  get: protectedProcedure
    .input(
      z.object({
        procedureId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const procedure = await db.query.procedure.findFirst({
        where: and(
          eq(schema.procedure.id, input.procedureId),
          eq(schema.procedure.companyId, ctx.session.orgId!)
        ),
      });

      return procedure;
    }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        estado: z.string(),
        family_group: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const new_procedure = await db
        .insert(schema.procedure)
        .values({
          companyId: ctx.session.orgId!,
          ...input,
        })
        .returning();
      return new_procedure;
    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.string().optional(),
        estado: z.string(),
        family_group: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ input }) => {
      //editar cada tabla por separado.
      const updatedprocedure = await db
        .update(schema.procedure)
        .set(input)
        .where(eq(schema.procedure.id, input.id));
      return updatedprocedure;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        procedureId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.procedure)
        .where(eq(schema.procedure.id, input.procedureId));
    }),
});
