import { type FileRouter, createUploadthing } from 'uploadthing/next'
import { z } from 'zod'
import { createId } from '~/lib/utils'
import { getServerAuthSession } from '~/server/auth'
import { db } from '~/server/db'
import * as schema from '~/server/db/schema'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  massiveGenerationUpload: f({
    "application/vnd.ms-excel": {
      maxFileCount: 1,
      maxFileSize: "128MB",
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileCount: 1,
      maxFileSize: "128MB",
    },
  })
    .input(z.object({ companyId: z.string() }))
    .middleware(async ({ req, input }) => {
      // This code runs on your server before upload
      const user = await auth(req);

      // If you throw, the user will not be able to upload
      if (!user) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id, companyId: input.companyId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      const uploadId = createId();

      await db.insert(schema.excelBilling).values({
        id: uploadId,
        userId: metadata.userId,
        url: file.url,
        fileName: file.name,
        companyId: metadata.companyId,
      });

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadId };
    }),

  responseUpload: f({
    "text/plain": {
      maxFileCount: 1,
      maxFileSize: "1MB",
    },
  })
    .input(z.object({ channel: z.string() }))
    .middleware(async ({ req, input }) => {
      // This code runs on your server before upload
      const user = await auth(req);

            // If you throw, the user will not be able to upload
            if (!session) {
                throw new Error('Unauthorized')
            }

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { userId: session.user.id, channelName: input.channel }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const uploadId = createId()

            await db.insert(schema.responseDocumentUploads).values({
                id: uploadId,
                userId: metadata.userId,
                fileUrl: file.url,
                fileName: file.name,
                fileSize: file.size,
            })

            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return { uploadId }
        }),

    documentUpload: f({
        'application/vnd.ms-excel': {
            maxFileCount: 1,
            maxFileSize: '128MB',
        },
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
            maxFileCount: 1,
            maxFileSize: '128MB',
        },
    })
        .input(
            z.object({
                companyId: z.string(),
            }),
        )
        // Set permissions and file types for this FileRoute
        .middleware(async ({ input }) => {
            // This code runs on your server before upload
            const session = await getServerAuthSession()

            // If you throw, the user will not be able to upload
            if (!session) {
                throw new Error('Unauthorized')
            }

            // Whatever is returned here is accessible in onUploadComplete as `metadata`
            return { userId: session.user.id, companyId: input.companyId }
        })
        .onUploadComplete(async ({ metadata, file }) => {
            const uploadId = createId()

            await db.insert(schema.documentUploads).values({
                id: uploadId,
                userId: metadata.userId,
                fileUrl: file.url,
                fileName: file.name,
                fileSize: file.size,
                companyId: metadata.companyId,
            })

            // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
            return { uploadId }
        }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
