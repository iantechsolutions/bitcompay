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
      const event = await db.query.events
        // .orderBy(schema.events.createdAt, "desc")
        .findFirst({
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
        ccId: z.string().max(255),
        type: z.string().max(255),
        amount: z.number().max(255),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const lastEvent = await db.query.events.findFirst({
        orderBy: [desc(schema.events.createdAt)],
        where: eq(schema.events.currentAccount_id, input.ccId),
      });
      if (input.type == "REC") {
        const new_event = await db
          .insert(schema.events)
          .values({
            description: "Recaudacion",
            currentAccount_id: input.ccId,
            type: input.type,
            event_amount: input.amount,
            current_amount: (lastEvent?.current_amount ?? 0) + input.amount,
          })
          .returning();
        await db.insert(schema.events).values({
          description: "Recaudacion",
          currentAccount_id: ctx.session.orgId,
          type: input.type,
          event_amount: input.amount,
          current_amount: (lastEvent?.current_amount ?? 0) + input.amount,
        });
        return new_event;
      }
      if (input.type == "FC") {
        const new_event = await db
          .insert(schema.events)
          .values({
            description: "Comprobante Creado",
            currentAccount_id: input.ccId,
            type: input.type,
            event_amount: input.amount * -1,
            current_amount: (lastEvent?.current_amount ?? 0) - input.amount,
          })
          .returning();
        await db.insert(schema.events).values({
          description: "Comprobante Creado",
          currentAccount_id: ctx.session.orgId,
          type: input.type,
          event_amount: input.amount,
          current_amount: (lastEvent?.current_amount ?? 0) + input.amount,
        });
        return new_event;
      }
      if (input.type == "NC") {
        const new_event = await db
          .insert(schema.events)
          .values({
            description: "Nota de credito",
            currentAccount_id: input.ccId,
            type: input.type,
            event_amount: input.amount,
            current_amount: (lastEvent?.current_amount ?? 0) + input.amount,
          })
          .returning();

        await db.insert(schema.events).values({
          description: "Nota de credito",
          currentAccount_id: ctx.session.orgId,
          type: input.type,
          event_amount: input.amount,
          current_amount: (lastEvent?.current_amount ?? 0) + input.amount,
        });

        return new_event;
      }
      // const new_plan = await db
      //   .insert(schema.plans)
      //   .values({
      //     user: user?.id ?? "",
      //     plan_code: input.plan_code,
      //     description: input.description,
      //     brand_id: input.brand_id,
      //   })
      //   .returning();
      // return new_plan;
    }),
});
export type Events = RouterOutputs["events"]["list"][number];
