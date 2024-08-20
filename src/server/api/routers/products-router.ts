import { and, eq, inArray, asc } from "drizzle-orm";
import { z } from "zod";
import { createId } from "~/lib/utils";
import { db, schema } from "~/server/db";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const productsChannel = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    // const company = await db.query.companies.findFirst({
    //   where: eq(schema.companies.id, ctx.session.orgId ?? ""),
    //   with: {
    //     products: {
    //       with: {
    //         product: {
    //           with: {
    //             channels: {
    //               with: {
    //                 channel: true,
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // });
    const products = await db.query.products.findMany({
      with: {
        channels: {
          with: {
            channel: true,
          },
        },
      },
    });
    return products;
  }),
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().min(0).max(1023),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const id = createId();

      const product = await db
        .insert(schema.products)
        .values({
          id,
          name: input.name,
          description: input.description,
        })
        .returning();
      await db.insert(schema.companyProducts).values({
        companyId: ctx.session.orgId ?? "",
        productId: product[0] ? product[0].id : "",
      });
      return { id };
    }),
  get: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      })
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
          company: {
            with: {
              company: true,
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
      })
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
        companies: z.array(z.string()).optional(),
      })
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
              (productChannel) => productChannel.channelId === channelId
            );
          });

          if (channelsToDelete.length > 0) {
            await tx.delete(schema.productChannels).where(
              and(
                eq(schema.productChannels.productId, input.productId),
                inArray(
                  schema.productChannels.channelId,
                  channelsToDelete.map(
                    (productChannel) => productChannel.channelId
                  )
                )
              )
            );
          }

          if (channelsToAdd.length > 0) {
            await tx.insert(schema.productChannels).values(
              channelsToAdd.map((channelId) => ({
                productId: input.productId,
                channelId,
              }))
            );
          }
        }
        const productCompanies = await tx.query.companyProducts.findMany({
          where: eq(schema.companyProducts.productId, input.productId),
        });
        console.log("input.companies", input.companies);
        if (input.companies) {
          const companies = new Set(input.companies);

          const companiesToDelete = productCompanies.filter(
            (productCompany) => {
              return !companies.has(productCompany.companyId);
            }
          );
          const companiesToAdd = input.companies.filter((companyId) => {
            return !productCompanies.find(
              (productCompany) => productCompany.companyId === companyId
            );
          });

          if (companiesToDelete.length > 0) {
            await tx.delete(schema.companyProducts).where(
              and(
                eq(schema.companyProducts.productId, input.productId),
                inArray(
                  schema.companyProducts.companyId,
                  companiesToDelete.map(
                    (companiesToDelete) => companiesToDelete.companyId
                  )
                )
              )
            );
          }
          if (companiesToAdd.length > 0) {
            await tx.insert(schema.companyProducts).values(
              companiesToAdd.map((companyId) => ({
                productId: input.productId,
                companyId,
              }))
            );
          }
        }
      });
    }),
  delete: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
      })
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
