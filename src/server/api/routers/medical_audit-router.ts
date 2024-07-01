import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq } from "drizzle-orm";
import {medical_audit } from "~/server/db/schema";
import { medical_auditSchemaDB } from "~/server/db/schema";



export const medical_auditRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const medical_audit = await db.query.medical_audit.findMany();
    return medical_audit;
  }),
  get: protectedProcedure
    .input(
      z.object({
        medical_auditId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const medical_audit = await db.query.medical_audit.findFirst({
        where: eq(schema.medical_audit.id, input.medical_auditId),
      });

      return medical_audit;
    }),

  create: protectedProcedure
    .input(medical_auditSchemaDB)
    .mutation(async ({ input }) => {
      const newmedical_audit = await db
        .insert(schema.medical_audit)
        .values({ ...input});

      return medical_audit;
    }),

  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...medical_auditSchemaDB.shape,
      }),
    )
    .mutation(async ({ input: { id, ...input } }) => {
      console.log("Function called");

      const updatedmedical_audit = await db
        .update(schema.medical_audit)
        .set(input)
        .where(eq(schema.medical_audit.id, id));
      console.log(updatedmedical_audit);
      return updatedmedical_audit;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        medical_auditId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.medical_audit)
        .where(eq(schema.medical_audit.id, input.medical_auditId));
    }),
});
