import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";
import { and, eq, inArray } from "drizzle-orm";

export const companiesRouter = createTRPCRouter({
    list: protectedProcedure.query(async ({ ctx }) => {
        return await db.query.companies.findMany()
    }),

    get: protectedProcedure.input(z.object({
        companyId: z.string(),
    })).query(async ({ input }) => {
        const company = await db.query.companies.findFirst({
            where: eq(schema.companies.id, input.companyId),
            with: {
                channels: {},
            }
        })

        return company
    }),

    create: protectedProcedure.input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().min(0).max(1023),
    })).mutation(async ({ ctx, input }) => {
        // TODO: verificar permisos

        const id = createId()

        await db.insert(schema.companies).values({
            id,
            name: input.name,
            description: input.description,
        })

        return { id }
    }),

    change: protectedProcedure.input(z.object({
        companyId: z.string(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().min(0).max(1023).optional(),
        channels: z.array(z.string()).optional(),
    })).mutation(async ({ ctx, input }) => {

        await db.transaction(async tx => {
            await tx.update(schema.companies).set({
                name: input.name,
                description: input.description,
            }).where(eq(schema.companies.id, input.companyId))

            const companyChannels = await tx.query.companyChannels.findMany({
                where: eq(schema.companyChannels.companyId, input.companyId)
            })

            if (input.channels) {
                const channels = new Set(input.channels)

                const channelsToDelete = companyChannels.filter(companyChannel => {
                    return !channels.has(companyChannel.channelId)
                })

                const channelsToAdd = input.channels.filter(channelId => {
                    return !companyChannels.find(companyChannel => companyChannel.channelId === channelId)
                })


                if (channelsToDelete.length > 0) {
                    await tx.delete(schema.companyChannels).where(and(
                        eq(schema.companyChannels.companyId, input.companyId),
                        inArray(schema.companyChannels.channelId, channelsToDelete.map(companyChannel => companyChannel.channelId))
                    ))
                }

                if (channelsToAdd.length > 0) {
                    await tx.insert(schema.companyChannels).values(channelsToAdd.map(channelId => ({
                        companyId: input.companyId,
                        channelId,
                    })))
                }
            }
        })
    }),

    delete: protectedProcedure.input(z.object({
        companyId: z.string(),
    })).mutation(async ({ ctx, input }) => {
        await db.transaction(async tx => {
            await tx.delete(schema.companies).where(eq(schema.companies.id, input.companyId))
            await tx.delete(schema.companyChannels).where(eq(schema.companyChannels.companyId, input.companyId))
        })
    }),
})
