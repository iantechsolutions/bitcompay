import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq, lt, and, desc } from "drizzle-orm";
import { RouterOutputs } from "~/trpc/shared";

export const eventsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ input }) => {
    const events = await db.query.events.findMany({});
    return events;
  }),
  getByCC: protectedProcedure
    .input(
      z.object({
        ccId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const events = await db.query.events.findMany({
        where: eq(schema.events.currentAccount_id, input.ccId),
        orderBy: [desc(schema.events.createdAt)],
        with: {
          comprobantes: true,
        }
      });
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
        family_group_id: z.string(),
        type: z.string(),
        amount: z.number(),
        comprobante_id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const cc = await db.query.currentAccount.findFirst({
        where: eq(
          schema.currentAccount.family_group,
          input.family_group_id ?? ""
        ),
      });
      const lastEvent = await db.query.events.findFirst({
        orderBy: [desc(schema.events.createdAt)],
        where: eq(schema.events.currentAccount_id, cc?.id ?? ""),
      });
      let new_event;

      // await db.insert(schema.events).values({
      //   description: "eNTITY",
      //   currentAccount_id: "org_2if0GnHd97NNeFY7PHGrkUfSydE",
      //   type: "FC",
      //   event_amount: input.amount,
      //   current_amount: (lastEvent?.current_amount ?? 0) + input.amount,
      // });

      switch (input.type) {
        case "REC":
          new_event = await db
            .insert(schema.events)
            .values({
              description: "Recaudacion",
              currentAccount_id: cc?.id,
              comprobante_id: input.comprobante_id,
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
              currentAccount_id: cc?.id,
              comprobante_id: input.comprobante_id,
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
              currentAccount_id: cc?.id,
              comprobante_id: input.comprobante_id,
              type: input.type,
              event_amount: input.amount,
              current_amount: (lastEvent?.current_amount ?? 0) + input.amount,
            })
            .returning();
          break;
        default:
          throw new Error("Tipo de evento no reconocido");
      }

      return new_event;
    }),

    createByTypeOS: protectedProcedure
    .input(
      z.object({
        health_insurance_id: z.string(),
        type: z.string(),
        amount: z.number(),
        comprobante_id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const cc = await db.query.currentAccount.findFirst({
        where: eq(
          schema.currentAccount.health_insurance,
          input.health_insurance_id ?? ""
        ),
      });
      const lastEvent = await db.query.events.findFirst({
        orderBy: [desc(schema.events.createdAt)],
        where: eq(schema.events.currentAccount_id, cc?.id ?? ""),
      });
      let new_event;
      switch (input.type) {
        case "REC":
          new_event = await db
            .insert(schema.events)
            .values({
              description: "Recaudacion",
              currentAccount_id: cc?.id,
              comprobante_id: input.comprobante_id,
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
              currentAccount_id: cc?.id,
              comprobante_id: input.comprobante_id,
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
              currentAccount_id: cc?.id,
              comprobante_id: input.comprobante_id,
              type: input.type,
              event_amount: input.amount,
              current_amount: (lastEvent?.current_amount ?? 0) + input.amount,
            })
            .returning();
          break;
        default:
          throw new Error("Tipo de evento no reconocido");
      }

      return new_event;
    }),
  createByTypeOrg: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        amount: z.number(),
        comprobante_id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const cc = await db.query.currentAccount.findFirst({
        where: eq(schema.currentAccount.company_id, ctx.session.orgId ?? ""),
      });
      const lastEvent = await db.query.events.findFirst({
        orderBy: [desc(schema.events.createdAt)],
        where: eq(schema.events.currentAccount_id, cc?.id ?? ""),
      });
      console.log("looool test", input.comprobante_id);
      let new_event;
      switch (input.type) {
        case "REC":
          new_event = await db
            .insert(schema.events)
            .values({
              description: "Recaudacion",
              currentAccount_id: cc?.id,
              comprobante_id: input.comprobante_id,
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
              comprobante_id: input.comprobante_id,
              currentAccount_id: cc?.id,
              type: input.type,
              event_amount: input.amount,
              current_amount: (lastEvent?.current_amount ?? 0) - input.amount,
            })
            .returning();
          break;
        case "NC":
          new_event = await db
            .insert(schema.events)
            .values({
              description: "Nota de credito",
              comprobante_id: input.comprobante_id,
              currentAccount_id: cc?.id,
              type: input.type,
              event_amount: input.amount * -1,
              current_amount: (lastEvent?.current_amount ?? 0) + input.amount,
            })
            .returning();
          break;
        default:
          throw new Error("Tipo de evento no reconocido");
      }

      return new_event;
    }),
  createFirstEvent: protectedProcedure
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
              description: "Apertura",
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
              description: "Apertura",
              currentAccount_id: input.ccId,
              type: input.type,
              event_amount: input.amount,
              current_amount: (lastEvent?.current_amount ?? 0) - input.amount,
            })
            .returning();
          break;
        case "NC":
          new_event = await db
            .insert(schema.events)
            .values({
              description: "Apertura",
              currentAccount_id: input.ccId,
              type: input.type,
              event_amount: input.amount * -1,
              current_amount: (lastEvent?.current_amount ?? 0) + input.amount,
            })
            .returning();
          break;
        default:
          throw new Error("Tipo de evento no reconocido");
      }

      return new_event;
    }),
});

export type Events = RouterOutputs["events"]["list"][number];
