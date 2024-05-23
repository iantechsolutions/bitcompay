import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import * as schema from "~/server/db/schema";
import { type DBTX, db } from "~/server/db";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import * as xlsx from "xlsx";
import { recRowsTransformer } from "~/server/excel/validator";
import { read } from "fs";

export const excelDeserializationRouter = createTRPCRouter({
  deserialization: protectedProcedure
    .input(
      z.object({
        type: z.literal("rec"),
        id: z.string(),
        companyId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {


      const contents = await readExcelFile(db, input.id, input.type);

      await db.transaction(async (db) => {
        for (const row of contents) {
            await db.query.bussinessUnits.findFirst({where:eq(schema.bussinessUnits.description, row.business_unit)});
            await.db.insert(schema.family_groups).values({
    
            })
        }
      });
      
    }),
});

async function readExcelFile(db: DBTX, id: string, type: string | undefined) {
  const upload = await db.query.documentUploads.findFirst({
    where: eq(schema.documentUploads.id, id),
  }); // aca se cambia por la tabla correcta despues

  if (!upload) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }

  if (!type) {
    type = upload.documentType ?? undefined;
  }

  if (!type) {
    throw new TRPCError({ code: "BAD_REQUEST" });
  }
  const response = await fetch(upload.fileUrl);
  const content = await response.arrayBuffer();

  const workbook = xlsx.read(content, { type: "buffer" });

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]!]!;

  const rows = xlsx.utils.sheet_to_json(firstSheet) as unknown as Record<
    string,
    unknown
  >[];

  const trimmedRows = rows.map(trimObject);
  const transformedRows = recRowsTransformer(trimmedRows);

  for (let i = 0; i < transformedRows.length; i++) {
    const row = transformedRows[i]!;
    const rowNum = i + 2;
    console.log(row, rowNum);
  }

  return transformedRows;
}

function trimObject(obj: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (typeof value === "string") {
        const t = value.trim();

        if (t === "") return [key, null];

        return [key, t];
      }

      return [key, value];
    }),
  );
}
