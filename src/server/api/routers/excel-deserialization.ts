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
      let familyGroupMap = new Map<string | null, string>();

      await db.transaction(async (db) => {
        for (const row of contents) {
          const business_unit = await db.query.bussinessUnits.findFirst({
            where: eq(schema.bussinessUnits.description, row.business_unit),
          });
          const mode = await db.query.modos.findFirst({
            where: eq(schema.modos.description, row.mode),
          });
          const plan = await db.query.plans.findFirst({
            where: eq(schema.plans.plan_code, row.plan),
          });
          let familyGroupId = "";
          const primerIntegrante = isKeyPresent(
            row["own doc number"],
            familyGroupMap,
          );
          if (!primerIntegrante) {
            const bonus = await db
              .insert(schema.bonuses)
              .values({
                amount: row.bonus,
                appliedUser: " ", //a rellenar
                approverUser: " ", //a rellenar
                duration: "", //row["from bonus"]-row["to bonus"], cambiar schema a desde hasta
                reason: "", //a rellenar
              })
              .returning();

            const procedure = await db
              .insert(schema.procedure)
              .values({
                type: "", //a rellenar
                estado: "", //a rellenar
              })
              .returning();
            const familygroup = await db
              .insert(schema.family_groups)
              .values({
                businessUnit: business_unit!.id,
                validity: row.validity, // viene del excel "vigencia"
                plan: plan!.id,
                modo: mode!.id,
                receipt: " ", //a rellenar
                bonus: bonus[0]!.id,
                state: "Cargado", //queremos agregar columna con estado?
                procedureId: procedure[0]!.id,
                //payment_status default es pending
              })
              .returning();
            familyGroupMap.set(row["own doc number"], familygroup[0]!.id);
            familyGroupId = familygroup[0]!.id;
          } else {
            familyGroupId = familyGroupMap.get(row["own doc number"]) ?? "";
          }
        }
      });
    }),
});

function isKeyPresent(
  key: string | null,
  dictionary: Map<string | null, string>,
): boolean {
  return dictionary.has(key ?? "");
}

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
