import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import { administrative_auditSchemaDB } from "~/server/db/schema";

export const administrative_auditRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const administrative_audit = await db.query.administrative_audit.findMany();
    return administrative_audit;
  }),
  get: protectedProcedure
    .input(
      z.object({
        administrative_auditId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const administrative_audit =
        await db.query.administrative_audit.findFirst({
          where: eq(
            schema.administrative_audit.id,
            input.administrative_auditId,
          ),
        });

      return administrative_audit;
    }),

  create: protectedProcedure
    .input(administrative_auditSchemaDB)
    .mutation(async ({ input }) => {
      const newadministrative_audit = await db
        .insert(schema.administrative_audit)
        .values({ ...input });
      //hay que levantar el procedure y modificar el estado
      await db.update(schema.procedure).set({ estado: input.state });
      return newadministrative_audit;
    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...administrative_auditSchemaDB.shape,
      }),
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedadministrative_audit = await db
        .update(schema.administrative_audit)
        .set(input)
        .where(eq(schema.administrative_audit.id, id));
      console.log(updatedadministrative_audit);
      return updatedadministrative_audit;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        administrative_auditId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.administrative_audit)
        .where(
          eq(schema.administrative_audit.id, input.administrative_auditId),
        );
    }),
});
