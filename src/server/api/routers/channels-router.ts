import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";
import { eq } from "drizzle-orm";

export const channelsRouter = createTRPCRouter({
    get: protectedProcedure.input(z.object({
        channelId: z.string(),
    })).query(async ({ input }) => {
        const channel = await db.query.channels.findFirst({
            where: eq(schema.channels.id, input.channelId)
        })
    
        return channel
    }),

    create: protectedProcedure.input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().min(0).max(1023),
        number: z.number().min(1).max(255),
    })).mutation(async ({ ctx, input }) => {
        // TODO: verificar permisos

        const id = createId()

        await db.insert(schema.channels).values({
            id,
            name: input.name,
            description: input.description,
            number: input.number,
        })

        return { id }
    }),

    change: protectedProcedure.input(z.object({
        channelId: z.string(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().min(0).max(1023).optional(),
        number: z.number().min(1).max(255).optional(),
        requiredColumns: z.array(z.string()).optional(),
    })).mutation(async ({ ctx, input }) => {
        await db.update(schema.channels).set({
            name: input.name,
            description: input.description,
            number: input.number,
            requiredColumns: input.requiredColumns,
        }).where(eq(schema.channels.id, input.channelId))
    }) 
})