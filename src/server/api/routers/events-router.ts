import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq, lt, and, desc } from "drizzle-orm";
import { RouterOutputs } from "~/trpc/shared";

export const eventsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const events = await db.query.events.findMany();
    return events;
  }),
  getLastByDateAndCC: protectedProcedure
    .input(
      z.object({
        ccId: z.string(),
        date: z.date(),
      })
    )
    .query(async ({ input }) => {
      const event = await db.query.events.findFirst({
        orderBy: [desc(schema.events.createdAt)],
        where: and(
          eq(schema.events.currentAccount_id, input.ccId),
          lt(schema.events.createdAt, input.date)
        ),
      });

      return event;
    }),
  createByType: protectedProcedure
    .input(
      z.object({
        ccId: z.string(),
        type: z.string(),
        amount: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const lastEvent = await db.query.events.findFirst({
        orderBy: [desc(schema.events.createdAt)],
        where: eq(schema.events.currentAccount_id, input.ccId),
      });
      let new_event;

      switch (input.type) {
        case "REC":
          new_event = await db
            .insert(schema.events)
            .values({
              description: "Recaudacion",
              currentAccount_id: input.ccId,
              type: input.type,
              event_amount: input.amount,
              current_amount: (lastEvent?.current_amount ?? 0) + input.amount,
            })
            .returning();
          break;
        case "FC":
          new_event = await db
            .insert(schema.events)
            .values({
              description: "Comprobante Creado",
              currentAccount_id: input.ccId,
              type: input.type,
              event_amount: input.amount * -1,
              current_amount: (lastEvent?.current_amount ?? 0) - input.amount,
            })
            .returning();
          break;
        case "NC":
          new_event = await db
            .insert(schema.events)
            .values({
              description: "Nota de credito",
              currentAccount_id: input.ccId,
              type: input.type,
              event_amount: input.amount,
              current_amount: (lastEvent?.current_amount ?? 0) + input.amount,
            })
            .returning();
          break;
        default:
          throw new Error("Tipo de evento no reconocido");
      }

      await db.insert(schema.events).values({
        description: new_event[0]!.description,
        currentAccount_id: ctx.session.orgId,
        type: new_event[0]!.type,
        event_amount: new_event[0]!.event_amount,
        current_amount: new_event[0]!.current_amount,
      });

      return new_event;
    }),
});

export type Events = RouterOutputs["events"]["list"][number];
