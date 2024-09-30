import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import * as schema from "~/server/db/schema";
import { type DBTX, db } from "~/server/db";
import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import * as xlsx from "xlsx";
import {
  recRowsTransformer,
  columnLabelByKey,
  keysArray,
} from "~/server/excel/validator";
import { error } from "console";
import { calcularEdad } from "~/lib/utils";

export const maxDuration = 300;
export const dynamic = "force-dynamic";
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
      })
    )
    .mutation(async ({ input, ctx }) => {
      const contents = await readExcelFile(db, input.id, input.type, ctx);
      //agregar a readExcel verificacion de columnas obligatorias.

      return contents;
    }),

  confirmData: protectedProcedure
    .input(
      z.object({
        type: z.literal("rec"),
        uploadId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const familyGroupMap = new Map<string | null, string>();
      const contents = await readExcelFile(db, input.uploadId, input.type, ctx);
      const idDictionary: { [key: string]: number } = {
        CUIT: 80,
        CUIL: 86,
        DNI: 96,
        "Consumidor Final": 99,
      };
      await db.transaction(async (db) => {
        for (const row of contents) {
          const business_unit = await db.query.bussinessUnits.findFirst({
            where: and(
              eq(schema.bussinessUnits.description, row.business_unit ?? ""),
              eq(schema.bussinessUnits.companyId, ctx.session.orgId ?? "")
            ),
          });

          const mode = await db.query.modos.findFirst({
            where: eq(schema.modos.description, row.mode ?? ""),
          });

          const plan = await db.query.plans.findFirst({
            where: and(
              eq(schema.plans.plan_code, row.plan ?? ""),
              eq(schema.plans.brand_id, business_unit?.brandId ?? "")
            ),
            with: {
              pricesPerCondition: true,
            },
          });

          const health_insurance = await db.query.healthInsurances.findFirst({
            where: eq(
              schema.healthInsurances.identificationNumber,
              row.os ?? ""
            ),
          });

          const health_insurance_origin =
            await db.query.healthInsurances.findMany({
              where: eq(
                schema.healthInsurances.identificationNumber,
                row["originating os"] ?? ""
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
                companyId: ctx.session.orgId ?? "",
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
                procedureId: procedure[0]?.id ?? "",
                entry_date: new Date(),
                sale_condition: row.sale_condition ?? "",
              })
              .returning();
            familyGroupMap.set(row.holder_id_number, familygroup[0]!.id);
            familyGroupId = familygroup[0]?.id ?? "";

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
          let postal_code_schema = await db.query.postal_code.findFirst({
            where: eq(schema.postal_code.cp, postal_code ?? " "),
          });

          if (!postal_code_schema) {
            const response = await db
              .insert(schema.postal_code)
              .values({
                cp: postal_code ?? "",
                name: postal_code ?? "",
                zone: "",
              })
              .returning();
            postal_code_schema = response[0];
          }

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
                  codigo: row.differential_code ?? "",
                })
                .returning();
              differentialId = new_differential[0]?.id ?? "";
            } else {
              differentialId = check_differential[0]?.id ?? "";
            }
          }

          const birthDate = new Date(row.birth_date ?? "");
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
            where: eq(schema.relative.relation, row.relationship ?? ""),
          });
          if (!relativeExist || relativeExist.length == 0) {
            await db.insert(schema.relative).values({
              relation: row.relationship,
            });
          }
          console.log("creando integrante");
          let affiliateNumber = row?.plan ?? "" + row?.own_id_number ?? "";
          if (row.own_id_type === "PASAPORTE") {
            affiliateNumber = "00" + affiliateNumber;
          }
          console.log("testigo", row.own_id_type);
          const new_integrant = await db
            .insert(schema.integrants)
            .values({
              affiliate_type: "type",
              relationship: row.relationship,
              name: row.name ?? "",
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
              cp: row["postal code"],
              zone: " ", //a rellenar
              isHolder: row.isHolder == true,
              isPaymentHolder: row.isPaymentHolder == true,
              isAffiliate: row.isAffiliated == true,
              isBillResponsible: row.isPaymentResponsible == true,
              age: age,
              family_group_id: familyGroupId,
              affiliate_number: affiliateNumber,
              extention: " ",
              postal_codeId: postal_code_schema?.id,
              health_insuranceId: health_insurance?.id ?? null,
              originating_health_insuranceId:
                health_insurance_origin.length > 0
                  ? health_insurance_origin[0]?.id ?? ""
                  : null,
            })
            .returning();
          console.log("creando valores diferencial valor");
          console.log("Llego Llego");

          if (new_integrant[0]?.isBillResponsible) {
            const cc = await db
              .insert(schema.currentAccount)
              .values({
                family_group: new_integrant[0]?.family_group_id ?? "",
              })
              .returning();
            const event = await db.insert(schema.events).values({
              current_amount: parseFloat(row.balance ?? "0"),
              description: "Apertura",
              event_amount: parseFloat(row.balance ?? "0"),
              currentAccount_id: cc[0]?.id ?? "",
              type: "REC",
            });
            console.log("Llego Llego");

            const tipoDocumento = idDictionary[new_integrant[0]?.id_type ?? ""];
            const factura = await db.insert(schema.comprobantes).values({
              origin: "Factura",
              importe: parseFloat(row.balance ?? "0") * -1,
              iva: "0",
              family_group_id: new_integrant[0]?.family_group_id ?? "",
              billLink: "",
              concepto: 0,
              nroComprobante: 0,
              nroDocumento: parseInt(new_integrant[0].id_number ?? "0"),
              prodName: "",
              ptoVenta: 0,
              generated: new Date(),
              tipoDocumento: tipoDocumento ?? 0,
              tipoComprobante: "Apertura de CC",
              estado: "apertura",
            });
          }
          console.log("Llego Llego");
          if (row.differential_value) {
            const ageN = calcularEdad(row.birth_date ?? new Date());
            const preciosPasados = plan?.pricesPerCondition.filter(
              (price) => price.validy_date.getTime() <= new Date().getTime()
            );
            preciosPasados?.sort(
              (a, b) => b.validy_date.getTime() - a.validy_date.getTime()
            );
            let precioIntegrante = 0;
            console.log("precios pasados");
            if (preciosPasados) {
              const vigente = preciosPasados[0]?.validy_date;
              console.log("vigente", vigente);
              precioIntegrante =
                plan?.pricesPerCondition
                  ?.filter(
                    (x) => x.validy_date.getTime() === vigente?.getTime()
                  )
                  .find(
                    (x) => row.relationship && x.condition == row.relationship
                  )?.amount ?? 0;
              console.log("precioIntegrante", precioIntegrante);
              if (precioIntegrante === 0) {
                precioIntegrante =
                  plan?.pricesPerCondition
                    ?.filter(
                      (x) => x.validy_date.getTime() === vigente?.getTime()
                    )
                    .find(
                      (x) =>
                        (x.from_age ?? 1000) <= ageN && (x.to_age ?? 0) >= ageN
                    )?.amount ?? 0;
              }
              console.log("precioIntegrante", precioIntegrante);
            }
            console.log("row");
            console.log(row.differential_value);
            console.log(precioIntegrante);
            const precioDiferencial =
              parseFloat(row.differential_value ?? "0") / precioIntegrante;
            // precioIntegrante;
            console.log("precioDiferencial", precioDiferencial);
            const differentialValue = await db
              .insert(schema.differentialsValues)
              .values({
                amount: precioDiferencial,
                differentialId: differentialId,
                integrant_id: new_integrant[0]?.id ?? "",
              });
          }
          if (row.isPaymentResponsible) {
            const companyProducts = await db.query.companyProducts.findMany({
              where: eq(
                schema.companyProducts.companyId,
                ctx.session.orgId ?? ""
              ),
              with: {
                product: true,
              },
            });
            console.log("lectura prod");
            const product = companyProducts.find(
              (x) => (x.product && x.product.name) ?? "" === row.product
            )?.product;
            console.log("post lectura prod");
            await db.insert(schema.pa).values({
              card_number: row.card_number?.toString() ?? null,
              CBU: row.cbu,
              new_registration: row.is_new ?? false,
              integrant_id: new_integrant[0]?.id ?? "",
              product_id: product?.id,
              // CBU: row.cbu_number!,
              card_brand: row.card_brand ?? null,
              card_type: row.card_type ?? null,
              // new_registration: row.is_new!,
              // integrant_id: new_integrant[0]!.id,
              // product: product?.id,
            });
          }
          const contribution = parseFloat(row.contribution ?? "");
          console.log("creando aportes");
          await db.insert(schema.contributions).values({
            employeeContribution: 0,
            employerContribution: contribution,
            amount: contribution,
            integrant_id: new_integrant[0]?.id ?? "",
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
  ctx: any,
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
  let brands = await db.query.brands.findMany({
    with: { company: true },
  });
  brands = brands.filter((x) =>
    x.company.some((x) => x.companyId === ctx.session.orgId)
  );
  for (let i = 0; i < transformedRows.length; i++) {
    const row = transformedRows[i]!;
    const rowNum = i + 2;
    const companyProducts = await db.query.companyProducts.findMany({
      where: eq(schema.companyProducts.companyId, ctx.session.orgId!),
      with: {
        product: true,
      },
    });
    console.log("companyProducts", companyProducts);
    console.log("product", row.product);
    const product = companyProducts.find(
      (x) => x.product && x.product.name === row.product
    )?.product;

    // await db.query.products.findFirst({
    //   where: eq(schema.products.name, row.product!),
    // });
    if (product) {
      const requiredColumns = await getRequiredColums(product.description);
      if (requiredColumns.has("card_number")) {
        if ((row.card_number?.length ?? 0) < 16) {
          errors.push(
            `El numero de tarjeta debe tener 16 digitos (fila:${rowNum})`
          );
        } else {
          console.log(row.card_number?.slice(0, 8));
          const response = await fetch(
            `https://data.handyapi.com/bin/${row.card_number?.slice(0, 8)}`
          );
          const json = await response?.json();
          console.log(json);
          let row_card_type = row.card_type ?? json?.Type;
          let row_card_brand = row.card_brand ?? json?.Scheme;

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
          if (json?.CardTier && json.CardTier == "PREPAID MASTERCARD CARD") {
            row_card_type = "DEBIT";
          }
          if (row_card_brand && row_card_type) {
            row.card_brand = row_card_brand;
            row.card_type = row_card_type;
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
    const health_insurance = await db.query.healthInsurances.findFirst({
      where: and(
        eq(schema.healthInsurances.identificationNumber, row.os!),
        eq(schema.healthInsurances.companyId, ctx.session.orgId!)
      ),
    });
    if (!health_insurance) {
      errors.push(
        `OBRA SOCIAL no valida o no perteneciente a la organizacion en (fila:${rowNum})`
      );
    }

    const business_unit = await db.query.bussinessUnits.findFirst({
      where: and(
        eq(schema.bussinessUnits.description, row.business_unit!),
        eq(schema.bussinessUnits.companyId, ctx.session.orgId!)
      ),
    });
    if (!business_unit) {
      errors.push(
        `UNIDAD DE NEGOCIO no valida o no perteneciente a la organizacion en (fila:${rowNum})`
      );
    } else {
      const plan = await db.query.plans.findFirst({
        where: and(
          eq(schema.plans.plan_code, row.plan!),
          eq(schema.plans.brand_id, business_unit.brandId)
        ),
      });
      if (!plan) {
        errors.push(
          `PLAN no valido o no perteneciente a la marca en (fila:${rowNum})`
        );
      }
    }
    // if (business_unit?.companyId !== ctx.session.orgId) {
    //   errors.push(
    //     `UNIDAD DE NEGOCIO no pertenece a la organizacion (fila:${rowNum}) `
    //   );
    // }

    if (
      row.differential_value &&
      row.differential_value !== "0" &&
      !row.differential_code
    ) {
      errors.push(`CODIGO DIFERENCIAL requerido en (fila:${rowNum})`);
    }
    if (row.mode?.toUpperCase() === "MIXTO") {
      const health_insurance = await db.query.healthInsurances.findFirst({
        where: eq(schema.healthInsurances.identificationNumber, row.os!),
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
      if (!health_insurance) {
        errors.push(
          `OBRA SOCIAL no valida en (fila:${rowNum}) para integrante MIXTO`
        );
      }
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
    const planes = await db.query.plans.findMany({
      where: eq(schema.plans.plan_code, row.plan!),
    });
    const plan = planes.filter((x) => brands.some((y) => y.id === x.brand_id));

    if (!plan) {
      errors.push(`PLAN no valido en (fila:${rowNum})`);
    }

    const postal_code = row["postal code"];
    // const check_postal_code = await db.query.postal_code.findMany({
    //   where: eq(schema.postal_code.cp, postal_code ?? " "),
    // });

    // if (check_postal_code.length == 0) {
    //   errors.push(`CODIGO POSTAL no valido en (fila:${rowNum})`);
    // }
    if (!product) {
      errors.push(`PRODUCTO no valido en (fila:${rowNum})`);
    }
    if (product) {
      const requiredColumns = await getRequiredColums(product.description);
      console.log("row", row);
      for (const column of requiredColumns) {
        const columnName = columnLabelByKey[column];
        const value = row[column as keyof typeof row];
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
  console.log("Testimonio", transformedRows[0]?.own_id_type);
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
