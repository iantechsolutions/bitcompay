import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { db, schema } from "~/server/db";
export const tributesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        tribute: z.string(),
        jurisdiction: z.string(),
        base_imponible: z.number(),
        amount: z.number(),
        alicuota: z.number(),
        comprobante_id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const new_tribute = await db.insert(schema.otherTributes).values({
        tribute: input.tribute,
        jurisdiction: input.jurisdiction,
        alicuota: input.alicuota,
        base_imponible: input.base_imponible,
        amount: input.amount,
        comprobanteId: input.comprobante_id,
      });
      return new_tribute;
    }),
});
