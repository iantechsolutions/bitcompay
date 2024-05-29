import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import * as schema from "~/server/db/schema";
import { type DBTX, db } from "~/server/db";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import * as xlsx from "xlsx";
import { recRowsTransformer, columnLabelByKey, keysArray } from "~/server/excel/validator";

export const excelDeserializationRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(
      z.object({
        uploadId:z.string(),
      }),
    )
    .query(async ({input})=>{
      const upload= await db.query.excelBilling.findFirst({
        where: eq(schema.excelBilling.id, input.uploadId),
      });
      return upload;
    }),

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
      //agregar a readExcel verificacion de columnas obligatorias. 
      console.log("contents:  ", contents);

      return contents;
    }),

  confirmData: protectedProcedure
    .input(
      z.object({
        type: z.literal("rec"),
        uploadId: z.string(),
        companyId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      console.log("escribiendo en tablas: integrantes,unidad de negocio,family group,differencial, codigo postal, payment_info  ")
      const familyGroupMap = new Map<string | null, string>();
      const contents = await readExcelFile(db, input.uploadId, input.type);
      await db.transaction(async (db) => {
        for (const row of contents) {
          const business_unit = await db.query.bussinessUnits.findFirst({
            where: eq(schema.bussinessUnits.description, row.business_unit!),
          });
          const mode = await db.query.modos.findFirst({
            where: eq(schema.modos.description, row.mode!),
          });
          const plan = await db.query.plans.findFirst({
            where: eq(schema.plans.plan_code, row.plan!),
          });
          let familyGroupId = "";
          const existGroup = isKeyPresent(row.holder_id_number, familyGroupMap);
          if (!existGroup) {
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
                businessUnit: business_unit?.id,
                validity: row.validity, // viene del excel "vigencia"
                plan: plan?.id,
                modo: mode?.id,
                receipt: " ", //a rellenar
                bonus: bonus[0]!.id,
                state: "Cargado", //queremos agregar columna con estado?
                procedureId: procedure[0]!.id,
                //payment_status default es pending
              })
              .returning();
            familyGroupMap.set(row.holder_id_number, familygroup[0]!.id);
            familyGroupId = familygroup[0]!.id;
          } else {
            familyGroupId = familyGroupMap.get(row.holder_id_number) ?? "";
          }

          const postal_code = row["postal code"];
          const check_postal_code = await db.query.postal_code.findMany({
            where: eq(schema.postal_code.cp, postal_code ?? " "),
          });
          let postal_code_id = "";
          if (check_postal_code.length == 0) {
            const new_postal_code = await db
              .insert(schema.postal_code)
              .values({
                name: "", //a rellenar
                cp: postal_code,
                zone: row.city,
              })
              .returning();
            postal_code_id = new_postal_code[0]!.id;
          } else {
            postal_code_id = check_postal_code[0]!.id;
          }

          let differentialId;
          const check_differential = await db.query.differentials.findMany({
            where: eq(schema.differentials.codigo, row.differential_code!),
          });
          if (check_differential.length == 0) {
            const new_differential = await db
              .insert(schema.differentials)
              .values({
                codigo: row.differential_code!,
              })
              .returning();
            differentialId = new_differential[0]!.id;
          }

          const birthDate = new Date(row.birth_date!);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          // Additional logic to handle cases where the birth date hasn't occurred yet this year
          if (
            today.getMonth() < birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() &&
              today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          const new_integrant = await db
            .insert(schema.integrants)
            .values({
              postal_codeId: postal_code_id,
              extention: " ",
              family_group_id: familyGroupId,
              affiliate_type: "",
              relationship: row.relationship,
              name: row.name,
              id_type: row.own_id_type,
              id_number: row.own_id_number,
              birth_date: row.birth_date,
              gender: row.gender,
              civil_status: row["marital status"],
              nationality: row.nationality,
              afip_status: row["afip status"],
              fiscal_id_type: row.fiscal_id_type,
              fiscal_id_number: row.fiscal_id_number,
              address: row.address,
              phone_number: row.phone,
              cellphone_number: row.cellphone,
              email: row.email,
              floor: row.floor,
              department: row.apartment,
              locality: row.city,
              partido: row.district,
              state: row.state,
              zone: " ", //a rellenar
              isHolder: row.isHolder,
              isPaymentHolder: row.isPaymentHolder,
              isAffiliate: row.isAffiliated,
              isBillResponsible: row.isPaymentResponsible,
              age: age,
              affiliate_number: row.affiliate_number,
            })
            .returning();
          await db.insert(schema.differentialsValues).values({
            amount: parseInt(row.differential_value!),
            differentialId: differentialId,
            integrant_id: new_integrant[0]!.id,
          });

          if(row.isPaymentResponsible){
            await db.insert(schema.payment_info).values({
              card_number: row.card_number!,  
              CBU: row.cbu_number!,
              card_brand: row.card_brand!,
              new_registration: row.new_registration!,
              integrant_id: new_integrant[0]!.id,
            });
          }
        }
        await db
        .update(schema.excelBilling)
        .set({
            confirmed: true,
            confirmedAt: new Date(),
        })
        .where(eq(schema.excelBilling.id, input.uploadId))
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
  const upload = await db.query.excelBilling.findFirst({
    where: eq(schema.excelBilling.id, id),
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
  const response = await fetch(upload.url);
  const content = await response.arrayBuffer();

  const workbook = xlsx.read(content, { type: "buffer" });

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]!]!;

  const rows = xlsx.utils.sheet_to_json(firstSheet) as unknown as Record<
    string,
    unknown
  >[];

  const trimmedRows = rows.map(trimObject);
  const transformedRows = recRowsTransformer(trimmedRows);
  const errors: string[] = []
  for (let i = 0; i < transformedRows.length; i++) {
    const row = transformedRows[i]!;
    const rowNum = i + 2;
    for (const column of keysArray) {
      const value = (row as Record<string, unknown>)[column];
      if (!value) {
        const columnName = columnLabelByKey[column] ?? column;

        errors.push(
          `La columna ${columnName} es obligatoria y no esta en el archivo(fila:${rowNum})`,
        );
      }
    }
  }

  if (errors.length > 0) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: errors.join('\n') })
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
