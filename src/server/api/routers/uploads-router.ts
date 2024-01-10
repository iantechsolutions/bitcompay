import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import * as schema from "~/server/db/schema";
import { DBTX, db } from "~/server/db";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import * as xlsx from 'xlsx'
import { recHeaders, recRowsTransformer } from "~/server/uploads/validators";
import { createId } from "~/lib/utils";

export const uploadsRouter = createTRPCRouter({
    upload: protectedProcedure.input(z.object({
        id: z.string()
    })).query(async ({ ctx, input }) => {
        const upload = await db.query.documentUploads.findFirst({
            where: eq(schema.documentUploads.id, input.id)
        })

        return upload
    }),
    readUploadContents: protectedProcedure.input(z.object({
        type: z.literal("rec"),
        id: z.string()
    })).mutation(async ({ ctx, input }) => {
        return await db.transaction(async tx => {
            const contents = await readUploadContents(tx, input.id, input.type)

            await tx.update(schema.documentUploads).set({
                documentType: input.type
            }).where(eq(schema.documentUploads.id, input.id))

            return contents
        })
    }),
    confirmUpload: protectedProcedure.input(z.object({
        id: z.string()
    })).mutation(async ({ ctx, input }) => {
        await db.transaction(async tx => {
            const { rows, upload } = await readUploadContents(tx, input.id)

            if(upload.confirmed) {
                tx.rollback()
            }

            await tx.update(schema.documentUploads).set({
                confirmed: true,
                confirmedAt: new Date(),
            }).where(eq(schema.documentUploads.id, input.id))

            await tx.insert(schema.payments).values(rows.map(row => ({
                id: createId(),
                userId: ctx.session.user.id,
                documentUploadId: upload.id,
                ...row
            })))
        })
    }),

})


async function readUploadContents(db: DBTX, id: string, type?: string) {
    const upload = await db.query.documentUploads.findFirst({
        where: eq(schema.documentUploads.id, id)
    })

    if (!upload) {
        throw new TRPCError({ code: "NOT_FOUND" })
    }

    if (!type) {
        type = upload.documentType || undefined
    }

    if (!type) {
        throw new TRPCError({ code: "BAD_REQUEST" })
    }

    const response = await fetch(upload.fileUrl)
    const content = await response.arrayBuffer()

    const workbook = xlsx.read(content, { type: 'buffer' })

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]!]!

    const rows = xlsx.utils.sheet_to_json(firstSheet) as Record<string, any>[]

    if (type === "rec") {
        console.log(rows.map(trimObject)[0])
        return {
            rows: recRowsTransformer(rows.map(trimObject)),
            headers: recHeaders,
            upload,
        }
    }

    throw new TRPCError({ code: "NOT_FOUND" })
}

function trimObject(obj: Record<string, any>) {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => {
        if (typeof value === "string") {
            const t = value.trim()

            if (t === "") return [key, null]

            return [key, t]
        }

        return [key, value]
    }))
}