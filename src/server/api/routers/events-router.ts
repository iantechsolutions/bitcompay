import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { eq, lt, and, desc } from "drizzle-orm";

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
});
