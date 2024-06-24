import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import * as schema from "~/server/db/schema";
import { type DBTX, db } from "~/server/db";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import * as xlsx from "xlsx";
import {
  recRowsTransformer,
  columnLabelByKey,
  keysArray,
} from "~/server/excel/validator";
import { error } from "console";
import { calcularEdad } from "~/lib/utils";

export const maxDuration = 60;

export const excelDeserializationRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(
      z.object({
        uploadId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const upload = await db.query.excelBilling.findFirst({
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
      })
    )
    .mutation(async ({ input }) => {
      const contents = await readExcelFile(db, input.id, input.type);
      //agregar a readExcel verificacion de columnas obligatorias.

      return contents;
    }),

  confirmData: protectedProcedure
    .input(
      z.object({
        type: z.literal("rec"),
        uploadId: z.string(),
        companyId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
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
            with: {
              pricesPerAge: true,
            },
          });

          const health_insurance = await db.query.healthInsurances.findFirst({
            where: eq(schema.healthInsurances.identificationNumber, row.os!),
          });

          const health_insurance_origin =
            await db.query.healthInsurances.findMany({
              where: eq(
                schema.healthInsurances.identificationNumber,
                row["originating os"]!
              ),
            });

          let familyGroupId = "";
          const existGroup = isKeyPresent(row.holder_id_number, familyGroupMap);
          if (!existGroup) {
            console.log("creando bono");
            console.log("creando tramite");
            const procedure = await db
              .insert(schema.procedure)
              .values({
                type: "alta",
                estado: "finalizado",
              })
              .returning();
            console.log("creando grupo familiar");
            const familygroup = await db
              .insert(schema.family_groups)
              .values({
                businessUnit: business_unit?.id,
                validity: row.validity,
                plan: plan?.id,
                modo: mode?.id,
                receipt: " ",
                state: "ACTIVO",
                procedureId: procedure[0]!.id,
              })
              .returning();
            familyGroupMap.set(row.holder_id_number, familygroup[0]!.id);
            familyGroupId = familygroup[0]!.id;
            const bonus = await db
              .insert(schema.bonuses)
              .values({
                amount: row.bonus ?? "0",
                appliedUser: " ", //a rellenar
                approverUser: " ", //a rellenar
                duration: "",
                from: row["from bonus"],
                to: row["to bonus"],
                reason: "", //a rellenar
                family_group_id: familyGroupId,
              })
              .returning();
          } else {
            familyGroupId = familyGroupMap.get(row.holder_id_number) ?? "";
          }

          const postal_code = row["postal code"];
          const postal_code_schema = await db.query.postal_code.findFirst({
            where: eq(schema.postal_code.cp, postal_code ?? " "),
          });

          let differentialId;
          if (row.differential_code) {
            const check_differential = await db.query.differentials.findMany({
              where: eq(schema.differentials.codigo, row.differential_code),
            });
            if (check_differential.length == 0) {
              console.log("creando diferencial codigo");
              const new_differential = await db
                .insert(schema.differentials)
                .values({
                  codigo: row.differential_code!,
                })
                .returning();
              differentialId = new_differential[0]!.id;
            } else {
              differentialId = check_differential[0]!.id;
            }
          }

          const birthDate = new Date(row.birth_date!);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          if (
            today.getMonth() < birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() &&
              today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          const relativeExist = await db.query.relative.findMany({
            where: eq(schema.relative.relation, row.relationship!),
          });
          if (!relativeExist || relativeExist.length == 0) {
            await db.insert(schema.relative).values({
              relation: row.relationship,
            });
          }
          console.log("creando integrante");
          const new_integrant = await db
            .insert(schema.integrants)
            .values({
              affiliate_type: "type",
              relationship: row.relationship,
              name: row.name,
              id_type: row.own_id_type,
              id_number: row.du_number,
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
              cp: row["postal code"],
              zone: " ", //a rellenar
              isHolder: row.isHolder == true,
              isPaymentHolder: row.isPaymentHolder == true,
              isAffiliate: row.isAffiliated == true,
              isBillResponsible: row.isPaymentResponsible == true,
              age: age,
              family_group_id: familyGroupId,
              affiliate_number: row.affiliate_number?.toString(),
              extention: " ",
              postal_codeId: postal_code_schema?.id,
              health_insuranceId: health_insurance?.id,
              originating_health_insuranceId:
                health_insurance_origin.length > 0
                  ? health_insurance_origin[0]!.id
                  : null,
            })
            .returning();
          console.log("creando valores diferencial valor");

          const cc = await db
            .insert(schema.currentAccount)
            .values({
              family_group: new_integrant[0]!.family_group_id,
            })
            .returning();
          const event = await db.insert(schema.events).values({
            current_amount: parseFloat(row.balance ?? "0"),
            description: "Apertura",
            event_amount: parseFloat(row.balance ?? "0"),
            currentAccount_id: cc[0]!.id,
            type: "REC",
          });
          if (row.differential_value) {
            const ageN = calcularEdad(row.birth_date ?? new Date());
            const precioIntegrante =
              plan?.pricesPerAge.find((p) => {
                if (
                  row.relationship &&
                  row.relationship.toLowerCase() != "titular"
                ) {
                  return p.condition == row.relationship;
                } else {
                  return p.age == ageN;
                }
              })?.amount ?? 0;
            const precioDiferencial =
              parseFloat(row.differential_value!) / precioIntegrante;
            const differentialValue = await db
              .insert(schema.differentialsValues)
              .values({
                amount: precioDiferencial,
                differentialId: differentialId,
                integrant_id: new_integrant[0]!.id,
              });
          }
          if (row.isPaymentResponsible) {
            const product = await db.query.products.findFirst({
              where: eq(schema.products.name, row.product!),
            });

            await db.insert(schema.pa).values({
              card_number: row.card_number!.toString(),
              CBU: row.cbu!,
              new_registration: row.is_new ?? false,
              integrant_id: new_integrant[0]!.id,
              product_id: product!.id!,
              // CBU: row.cbu_number!,
              card_brand: row.card_brand ?? null,
              card_type: row.card_type ?? null,
              // new_registration: row.is_new!,
              // integrant_id: new_integrant[0]!.id,
              // product: product?.id,
            });
          }
          const employeeContribution = parseFloat(row.contribution!);
          const employerContribution =
            (parseFloat(row.contribution!) / 3) * 7.038;
          console.log("creando aportes");
          await db.insert(schema.contributions).values({
            employeeContribution: employeeContribution,
            employerContribution: employerContribution,
            amount: employeeContribution + employerContribution,
            integrant_id: new_integrant[0]!.id,
            cuitEmployer: " ", //a rellenar
          });
        }

        await db
          .update(schema.excelBilling)
          .set({
            confirmed: true,
            confirmedAt: new Date(),
          })
          .where(eq(schema.excelBilling.id, input.uploadId));
      });
    }),
});

function isKeyPresent(
  key: string | null,
  dictionary: Map<string | null, string>
): boolean {
  return dictionary.has(key ?? "");
}

async function readExcelFile(
  db: DBTX,
  id: string,
  type: string | undefined,
  batchSize = 100
) {
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
  const { finishedArray: transformedRows, errors: errorsTransform } =
    recRowsTransformer(trimmedRows);
  console.log("rows", transformedRows);
  if (trimmedRows.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No se encontraron datos en el archivo",
    });
  }
  const errors: string[] = [];
  errorsTransform.forEach((error) => {
    errors.push(
      (error.errors.at(0)?.message ?? "") +
        " " +
        (error.errors.at(0)?.path.at(1) ?? "ILEGIBLE") +
        " (fila:" +
        (
          parseInt(error.errors.at(0)?.path.at(0)?.toString() ?? "0") + 1
        ).toString() +
        ")"
    );
  });
  for (let i = 0; i < transformedRows.length; i++) {
    const row = transformedRows[i]!;
    const rowNum = i + 2;
    const product = await db.query.products.findFirst({
      where: eq(schema.products.name, row.product!),
    });
    if (product) {
      const requiredColumns = await getRequiredColums(product.description);
      if (requiredColumns.has("card_number")) {
        if (row.card_number?.length ?? 0 < 16) {
          errors.push(
            `El numero de tarjeta debe tener 16 digitos (fila:${rowNum})`
          );
        } else {
          const response = await fetch(
            `https://data.handyapi.com/bin/${row.card_number}`
          );
          console.log("response", response);
          const json = await response?.json();
          let row_card_type = row.card_type ?? json?.card_type;
          let row_card_brand = row.card_brand ?? json?.card_brand;

          if (!row_card_brand || !row_card_type) {
            errors.push(
              `No se pudo obtener (${!row_card_brand ? "Marca" : ""}, ${
                !row_card_type ? "Tipo" : ""
              }) de la tarjeta en fila: ${rowNum} \n`
            );
          }

          if (!row_card_brand) {
            row_card_brand = json?.Scheme;
          }
          if (!row_card_type) {
            row_card_type = json?.Type;
          }
        }
      }
    }
    for (const column of keysArray) {
      const value = (row as Record<string, unknown>)[column];

      if (!value) {
        const columnName = columnLabelByKey[column] ?? column;

        errors.push(
          `La columna ${columnName} es obligatoria y no esta en el archivo (fila:${rowNum})`
        );
      }
    }

    const business_unit = await db.query.bussinessUnits.findFirst({
      where: eq(schema.bussinessUnits.description, row.business_unit!),
    });
    if (!business_unit) {
      errors.push(`UNIDAD DE NEGOCIO no valida en (fila:${rowNum})`);
    }

    if (row.differential_value && !row.differential_code) {
      errors.push(`CODIGO DIFERENCIAL requerido en (fila:${rowNum})`);
    }
    const health_insurance = await db.query.healthInsurances.findFirst({
      where: eq(schema.healthInsurances.identificationNumber, row.os!),
    });

    if (!health_insurance) {
      errors.push(`OBRA SOCIAL no valida en (fila:${rowNum})`);
    }
    const mode = await db.query.modos.findFirst({
      where: eq(schema.modos.description, row.mode!),
    });

    if (row["originating os"]) {
      const originating_os = await db.query.healthInsurances.findFirst({
        where: eq(
          schema.healthInsurances.identificationNumber,
          row["originating os"]!
        ),
      });
      if (!originating_os) {
        errors.push(`OBRA SOCIAL DE ORIGEN no valida en (fila:${rowNum})`);
      }
    }
    if (!mode) {
      errors.push(`MODO no valido en (fila:${rowNum})`);
    }
    const plan = await db.query.plans.findFirst({
      where: eq(schema.plans.plan_code, row.plan!),
    });
    if (!plan) {
      errors.push(`PLAN no valido en (fila:${rowNum})`);
    }

    const postal_code = row["postal code"];
    const check_postal_code = await db.query.postal_code.findMany({
      where: eq(schema.postal_code.cp, postal_code ?? " "),
    });

    if (check_postal_code.length == 0) {
      errors.push(`CODIGO POSTAL no valido en (fila:${rowNum})`);
    }
    if (!product) {
      errors.push(`PRODUCTO no valido en (fila:${rowNum})`);
    }
    if (product) {
      const requiredColumns = await getRequiredColums(product.description);
      console.log("required", requiredColumns);
      console.log("row", row);
      for (const column of requiredColumns) {
        console.log(column);
        const columnName = columnLabelByKey[column];
        console.log(columnName);
        const value = row[column as keyof typeof row];
        console.log(value);
        if (
          (column in row && !value) ||
          (column in row && value?.toString() === "")
        ) {
          errors.push(
            `La columna ${columnName} no puede ser nula ni estar vacia, es obligatoria para el producto (fila:${rowNum})`
          );
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new TRPCError({ code: "BAD_REQUEST", message: errors.join("\n") });
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
    })
  );
}

async function getRequiredColums(productName: string) {
  const product = await db.query.products.findFirst({
    where: eq(schema.products.description, productName),
    with: {
      channels: {
        with: {
          channel: {
            columns: {
              id: true,
              requiredColumns: true,
            },
          },
        },
      },
    },
  });

  const requiredColumns = new Set(
    product?.channels
      .map((c) => c.channel.requiredColumns)
      .reduce((acc, val) => acc.concat(val), [])
  );
  return requiredColumns;
}
