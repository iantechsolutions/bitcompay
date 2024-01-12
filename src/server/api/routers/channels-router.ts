import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db, schema } from "~/server/db";
import { createId } from "~/lib/utils";

export const channelsRouter = createTRPCRouter({
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
    })
})