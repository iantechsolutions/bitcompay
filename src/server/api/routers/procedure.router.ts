import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { procedure } from "~/server/db/schema";

export const procedureRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const procedures = await db.query.procedure.findMany({with:{
      administrative_audits:true,
      medical_audits:true,
    }});
    return procedures;
  }),
  get: protectedProcedure
    .input(
      z.object({
        procedureId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const procedure = await db.query.procedure.findFirst({
        where: eq(schema.procedure.id, input.procedureId),
      });

      return procedure;
    }),

  create: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        estado: z.string(),
        prospect: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const new_procedure = await db.insert(schema.procedure).values({
        ...input,
      }).returning();
      return new_procedure;
    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.string().optional(),
        estado: z.string(),
        prospect: z.string().optional(),
      }),
    )
    .mutation(async ({ input: { id, ...input } }) => {
      const updatedprocedure = await db
        .update(schema.procedure)
        .set(input)
        .where(eq(schema.procedure.id, id));
      return updatedprocedure;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        procedureId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.procedure)
        .where(eq(schema.procedure.id, input.procedureId));
    }),
});
