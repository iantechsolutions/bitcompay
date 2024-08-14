import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { createId } from "~/lib/utils";
import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const channelsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const channel = await db.query.channels.findFirst({
        where: eq(schema.channels.id, input.channelId),
        with: {
          products: {
            with: {
              product: true,
            },
          },
        },
      });

      return channel;
    }),

  list: protectedProcedure.query(async ({}) => {
    const channels = await db.query.channels.findMany({
      where: eq(schema.channels.enabled, true),
      orderBy: [asc(schema.channels.number)],
    });

    return channels;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().min(0).max(1023),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: verificar permisos

      const id = createId();

      await db.insert(schema.channels).values({
        id,
        name: input.name,
        description: input.description,
      });

      return { id };
    }),

  change: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().min(0).max(1023).optional(),
        requiredColumns: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(schema.channels)
        .set({
          name: input.name,
          description: input.description,
          requiredColumns: input.requiredColumns,
        })
        .where(eq(schema.channels.id, input.channelId));
    }),

  delete: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.channels)
        .where(eq(schema.channels.id, input.channelId));
      await db
        .delete(schema.productChannels)
        .where(eq(schema.productChannels.channelId, input.channelId));
    }),
});
