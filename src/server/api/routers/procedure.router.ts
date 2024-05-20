import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { procedure } from "~/server/db/schema";

export const procedureRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const procedures = await db.query.procedure.findMany();
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
        // code: z.string(),
        type: z.string(),
        estado: z.string(),
        prospect: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.insert(procedure).values(input);
    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        // code: z.string(),
        type: z.string(),
        estado: z.string(),
        prospect: z.string(),
      }),
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedprocedure = await db
        .update(schema.procedure)
        .set(input)
        .where(eq(schema.procedure.id, id));
      console.log(updatedprocedure);
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
