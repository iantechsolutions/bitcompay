import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";
import { and, eq, inArray } from "drizzle-orm";

export const productsChannel = createTRPCRouter({
  list: protectedProcedure.query(async () => {
    return await db.query.products.findMany({
      with: { channels: { with: { channel: true } } },
    });
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().min(0).max(1023),
        number: z.number().min(1).max(255),
      }),
    )
    .mutation(async ({ input }) => {
      const id = createId();

      await db.insert(schema.products).values({
        id,
        name: input.name,
        description: input.description,
        number: input.number,
      });

      return { id };
    }),
  get: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const product = await db.query.products.findFirst({
        where: eq(schema.products.id, input.productId),
        with: {
          channels: {
            with: {
              channel: true,
            },
          },
        },
      });

      return product;
    }),

  getByChannel: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const relations = await db.query.productChannels.findMany({
        where: eq(schema.productChannels.channelId, input.channelId),
      });

      const products = [];
      for (const relation of relations) {
        const t = await db.query.products.findMany({
          where: eq(schema.products.id, relation.productId),
        });
        for (const item of t) {
          products.push(item);
        }
      }
      return products;
    }),
  change: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().min(0).max(1023).optional(),
        channels: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        if (input.name ?? input.description) {
          await tx
            .update(schema.products)
            .set({
              name: input.name,
              description: input.description,
            })
            .where(eq(schema.products.id, input.productId));
        }

        const productChannels = await tx.query.productChannels.findMany({
          where: eq(schema.productChannels.productId, input.productId),
        });

        if (input.channels) {
          const channels = new Set(input.channels);

          const channelsToDelete = productChannels.filter((productChannel) => {
            return !channels.has(productChannel.channelId);
          });

          const channelsToAdd = input.channels.filter((channelId) => {
            return !productChannels.find(
              (productChannel) => productChannel.channelId === channelId,
            );
          });

          if (channelsToDelete.length > 0) {
            await tx.delete(schema.productChannels).where(
              and(
                eq(schema.productChannels.productId, input.productId),
                inArray(
                  schema.productChannels.channelId,
                  channelsToDelete.map(
                    (productChannel) => productChannel.channelId,
                  ),
                ),
              ),
            );
          }

          if (channelsToAdd.length > 0) {
            await tx.insert(schema.productChannels).values(
              channelsToAdd.map((channelId) => ({
                productId: input.productId,
                channelId,
              })),
            );
          }
        }
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        await tx
          .delete(schema.productChannels)
          .where(eq(schema.productChannels.productId, input.productId));
        await tx
          .delete(schema.products)
          .where(eq(schema.products.id, input.productId));
      });
    }),
});
