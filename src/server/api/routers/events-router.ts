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
        family_group_id: z.string(),
        type: z.string(),
        amount: z.number(),
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
              type: input.type,
              event_amount: input.amount,
              current_amount: (lastEvent?.current_amount ?? 0) + input.amount,
            })
            .returning();
          break;
        default:
          throw new Error("Tipo de evento no reconocido");
      }
      console.log(
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
      );

      return new_event;
    }),
  createByTypeOrg: protectedProcedure
    .input(
      z.object({
        type: z.string(),
        amount: z.number(),
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
      let new_event;
      switch (input.type) {
        case "REC":
          new_event = await db
            .insert(schema.events)
            .values({
              description: "Recaudacion",
              currentAccount_id: cc?.id,
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
      console.log(
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
      );

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
      console.log(
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
      );

      return new_event;
    }),
});

export type Events = RouterOutputs["events"]["list"][number];
