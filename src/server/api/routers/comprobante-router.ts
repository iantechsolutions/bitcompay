import { and, desc, eq, inArray, InferSelectModel, lt, sql } from "drizzle-orm";
import Afip from "@afipsdk/afip.js";
import { z } from "zod";
import { db, schema } from "~/server/db";
import {
  bussinessUnits,
  ComprobantesSchemaDB,
  differentials,
} from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Group } from "next/dist/shared/lib/router/utils/route-regex";
import { Plans } from "./plans-router";
import { Integrant } from "./integrant-router";
import { currentUser } from "@clerk/nextjs/server";
import { Brand } from "./brands-router";
import { RouterOutputs } from "~/trpc/shared";
import { PromisePool } from "@supercharge/promise-pool";

import {
  calcularEdad,
  comprobanteDictionary,
  formatDate,
  htmlBill,
  ingresarAfip,
} from "~/lib/utils";
import { utapi } from "~/server/uploadthing";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { PgUpdateBase, PgUpdatePrepare } from "drizzle-orm/pg-core";

// Extiende dayjs con los plugins necesarios
dayjs.extend(utc);
dayjs.extend(timezone);

// Configura la zona horaria de Buenos Aires
// const buenosAiresTime = dayjs().tz("America/Argentina/Buenos_Aires").toDate();
type Bonus = {
  id: string;
  appliedUser: string;
  approverUser: string;
  validationDate: null | string;
  duration: string;
  amount: string;
  reason: string;
};

type grupoCompleto =
  RouterOutputs["comprobantes"]["getGruposForLiquidation"][number];

const ivaDictionary: { [key: number]: string } = {
  3: "0",
  4: "10.5",
  5: "21",
  6: "27",
  8: "5",
  9: "2.5",
  0: "",
};

const ivaDictionaryInverso: { [key: string]: number } = {
  "0": 3,
  "10.5": 4,
  "21": 5,
  "27": 6,
  "5": 8,
  "2.5": 9,
  "": 0,
};

const fcAnc: { [key: string]: string } = {
  "FACTURA A": "NOTA DE CREDITO A",
  "FACTURA B": "NOTA DE CREDITO B",
  "FACTURA C": "NOTA DE CREDITO C",
  "FACTURA M": "NOTA DE CREDITO M",
  "FACTURA E": "NOTA DE CREDITO E",
  "NOTA DE CREDITO A": "FACTURA A",
  "NOTA DE CREDITO B": "FACTURA B",
  "NOTA DE CREDITO C": "FACTURA C",
  "NOTA DE CREDITO M": "FACTURA M",
  "NOTA DE CREDITO E": "FACTURA E",
};

const idDictionary: { [key: string]: number } = {
  CUIT: 80,
  CUIL: 86,
  DNI: 96,
  "Consumidor Final": 99,
};

// async function generatecomprobante(
//   afip: Afip,
//   grupo: grupoCompleto,
//   dateDesde: Date,
//   dateHasta: Date,
//   dateVencimiento: Date
// ) {
//   let last_voucher;
//   const puntoVenta = grupo.businessUnitData?.company?.puntoVenta;
//   try {
//     last_voucher = await afip.ElectronicBilling.getLastVoucher(puntoVenta, 11);
//   } catch {
//     last_voucher = 0;
//   }
//   const billResponsible = grupo.integrants.find(
//     (integrant) => integrant.isBillResponsible
//   );
//   const numero_de_comprobante = last_voucher + 1;

//   const fecha = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
//     .toISOString()
//     .split("T")[0];

//   const data = {
//     CantReg: 1, // Cantidad de comprobantes a registrar
//     PtoVta: puntoVenta,
//     CbteTipo: comprobanteDictionary[grupo.businessUnitData?.brand?.bill_type ?? ""],
//     Concepto: conceptDictionary[grupo.businessUnitData?.brand?.concept],
//     DocTipo: billResponsible?.fiscal_id_type,
//     DocNro: billResponsible?.fiscal_id_number,
//     CbteDesde: numero_de_comprobante,
//     CbteHasta: numero_de_comprobante,
//     CbteFch: parseInt(fecha?.replace(/-/g, "") ?? ""),
//     FchServDesde: formatDateAFIP(dateDesde),
//     FchServHasta: formatDateAFIP(dateHasta),
//     FchVtoPago: formatDateAFIP(dateVencimiento),
//     ImpTotal: importe,
//     ImpTotConc: 0, // Importe neto no gravado
//     ImpNeto: (Number(importe) * 1).toString(),
//     ImpOpEx: 0,
//     ImpIVA: 0,
//     ImpTrib: 0,
//     MonId: "PES",
//     MonCotiz: 1,
//     Iva: {
//       Id: ivaDictionary[grupo.businessUnitData?.brand?.iva ?? ""],
//       BaseImp: importe,
//       Importe: (Number(importe) * 0, 21).toString(),
//     },
//   };
//   /**
//    * Creamos la comprobante
//    **/
//   const res = await afip.ElectronicBilling.createVoucher(data);
// }

const preparedUpdatePayment = db
  .update(schema.payments)
  .set({
    statusId: sql.placeholder("statusId").getSQL(),
  })
  .where(eq(schema.payments.comprobante_id, sql.placeholder("comprobanteId")))
  .prepare("preparedUpdatePayment");

const preparedAddPayment = db
  .insert(schema.payments)
  .values({
    companyId: sql.placeholder("companyId"),
    invoice_number: sql.placeholder("invoice_number"),
    userId: sql.placeholder("userId"),
    g_c: sql.placeholder("g_c"),
    name: sql.placeholder("name"),
    fiscal_id_type: sql.placeholder("fiscal_id_type"),
    fiscal_id_number: sql.placeholder("fiscal_id_number"),
    du_type: sql.placeholder("du_type"),
    du_number: sql.placeholder("du_number"),
    product: sql.placeholder("product"),
    affiliate_number: sql.placeholder("affiliate_number"),
    period: sql.placeholder("period").getSQL(),
    first_due_amount: sql.placeholder("first_due_amount"),
    first_due_date: sql.placeholder("first_due_date").getSQL(),
    cbu: sql.placeholder("cbu"),
    comprobante_id: sql.placeholder("comprobante_id"),
    documentUploadId: sql.placeholder("documentUploadId"),
    product_number: sql.placeholder("product_number"),
    statusId: sql.placeholder("statusId"),
    card_number: sql.placeholder("card_number"),
    card_brand: sql.placeholder("card_brand"),
    card_type: sql.placeholder("card_type"),
  })
  .prepare("preparedAddPayment");

const preparedApproveLiquidation = db
  .update(schema.liquidations)
  .set({
    estado: "aprobada",
    userApproved: sql.placeholder("userApproved").getSQL(),
  })
  .where(eq(schema.liquidations.id, sql.placeholder("liquidationId")))
  .prepare("preparedApproveLiquidation");

const preparedCompBillLink = db
  .update(schema.comprobantes)
  .set({
    billLink: sql.placeholder("billLink").getSQL(),
    estado: sql.placeholder("estado").getSQL(),
    nroComprobante: sql.placeholder("voucher").getSQL(),
  })
  .where(eq(schema.comprobantes.id, sql.placeholder("comprobanteId")))
  .prepare("preparedCompBillLink");

const preparedBillResponsible = db.query.integrants
  .findFirst({
    where: and(
      eq(schema.integrants.family_group_id, sql.placeholder("family_groupId")),
      eq(schema.integrants.isBillResponsible, true)
    ),
    with: {
      postal_code: true,
      pa: true,
    },
  })
  .prepare("preparedBillResponsible");

async function approbatecomprobante(liquidationId: string) {
  const start = Date.now();
  console.log(`[START] Function start: ${start}`);

  const liquidationStart = Date.now();
  const liquidation = await db.query.liquidations.findFirst({
    where: eq(schema.liquidations.id, liquidationId),
    with: {
      comprobantes: {
        with: {
          items: true,
          family_group: {
            with: {
              integrants: {
                with: {
                  pa: true,
                  postal_code: true, // para evitar la recarga de integrants
                },
                // este filtrado lo hago para acortar el .find, total solo lo usamos ahi
                where: eq(schema.integrants.isBillResponsible, true),
              },
              businessUnitData: {
                with: {
                  company: true,
                  brand: { with: { company: true } },
                },
              },
              plan: true,
              cc: {
                with: {
                  events: true,
                },
              },
            },
          },
        },
      },
    },
  });
  console.log(`[TIMING] Liquidation query: ${Date.now() - liquidationStart}ms`);

  if (liquidation?.estado === "pendiente") {
    const userStart = Date.now();
    const user = await currentUser();

    const ccs = await db.query.currentAccount.findMany({
      with: {
        events: true,
      },
    });

    console.log(`[TIMING] Current user fetch: ${Date.now() - userStart}ms`);

    const updateStart = Date.now();
    await preparedApproveLiquidation.execute({
      userApproved: user?.id,
      liquidationId,
    });

    console.log(`[TIMING] Liquidation update: ${Date.now() - updateStart}ms`);

    console.log("Ingresando afip");
    const afipStart = Date.now();
    const afip = await ingresarAfip();

    console.log(`[TIMING] Afip login: ${Date.now() - afipStart}ms`);
    const [status, statusCancelado, productos] = await Promise.all([
      db.query.paymentStatus.findFirst({
        where: eq(schema.paymentStatus.code, "91"),
      }),
      db.query.paymentStatus.findFirst({
        where: eq(schema.paymentStatus.code, "90"),
      }),
      db.query.products.findMany(),
    ]);

    console.log("aca");

    console.log("aca2");

    console.log("aca3");

    const paymentFetchStart = Date.now();

    console.log(
      `[TIMING] Payment status and products fetch: ${
        Date.now() - paymentFetchStart
      }ms`
    );

    const productMapStart = Date.now();
    const productosMap = new Map<
      string,
      InferSelectModel<typeof schema.products>
    >();
    for (const prod of productos) {
      productosMap.set(prod.id, prod);
    }
    console.log(`[TIMING] Products mapping: ${Date.now() - productMapStart}ms`);

    const promisePoolStart = Date.now();
    const { results, errors } = await PromisePool.withConcurrency(1000)
      .for(liquidation?.comprobantes)
      .process(async (comprobante, index) => {
        const comprobanteCod =
          comprobanteDictionary[comprobante.tipoComprobante ?? ""];

        let lastVoucher = 0;
        const lastVoucherStart = Date.now();
        try {
          // lastVoucher = await afip.ElectronicBilling.getLastVoucher(
          //   comprobante?.ptoVenta,
          //   comprobanteCod
          // );
          // last_voucher = 0;
        } catch {
          lastVoucher = 0;
        }
        console.log(
          `[TIMING] Last voucher fetch (comprobante ${index}): ${
            Date.now() - lastVoucherStart
          }ms`
        );

        // const randomNumber =
        //   Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000;

        const billResponsibleStart = Date.now();
        const cachedBillResponsible =
          comprobante.family_group?.integrants?.find(
            (k) =>
              k.isBillResponsible &&
              comprobante.family_group?.id === k.family_group_id
          );

        const billResponsible =
          cachedBillResponsible ??
          (await preparedBillResponsible.execute({
            family_groupId: comprobante.family_group?.id ?? "",
          }));

        console.log(
          `[TIMING] Bill responsible fetch (comprobante ${index}): ${
            Date.now() - billResponsibleStart
          }ms`
        );

        const productFetchStart = Date.now();
        let producto = undefined;
        if (typeof billResponsible?.pa[0]?.product_id === "string") {
          producto = productosMap.get(billResponsible?.pa[0]?.product_id);
        }

        console.log(
          `[TIMING] Product fetch (comprobante ${index}): ${
            Date.now() - productFetchStart
          }ms`
        );

        const ccFetchStart = Date.now();
        // const cachedCc = comprobante.family_group?.cc;
        const cc = ccs.find((x) => x.id == comprobante.family_group?.cc?.id);
        let lastEventAmount = 0;
        if (cc?.events && cc?.events.length > 0) {
          lastEventAmount = cc?.events.reduce((prev, current) => {
            return new Date(prev.createdAt) > new Date(current.createdAt)
              ? prev
              : current;
          }).current_amount;
        }
        console.log(
          `[TIMING] Current account transaction (comprobante ${index}): ${
            Date.now() - ccFetchStart
          }ms`
        );

        const fecha = new Date(
          Date.now() - new Date().getTimezoneOffset() * 60000
        )
          .toISOString()
          .split("T")[0];

        const ivaByValue = ivaDictionaryInverso[comprobante?.iva];
        const listado: [number, string] | undefined =
          typeof ivaByValue === "number"
            ? [ivaByValue, comprobante.iva]
            : undefined;

        const ivaId = listado ? listado[0] : "0";
        const ivaFloat = parseFloat(comprobante?.iva ?? "0") / 100;
        let data = {};

        const processStart = Date.now();
        if (comprobante?.origin == "Nota de credito") {
          data = {
            CantReg: 1, // Cantidad de comprobantes a registrar
            PtoVta: comprobante?.ptoVenta,
            CbteTipo: comprobanteCod?.toString() ?? "",
            Concepto: Number(comprobante?.concepto),
            DocTipo: comprobante?.tipoDocumento,
            DocNro: comprobante?.nroDocumento,
            CbteDesde: lastVoucher + 1,
            CbteHasta: lastVoucher + 1,
            CbteFch: parseInt(fecha?.replace(/-/g, "") ?? ""),
            FchServDesde: formatDate(comprobante?.fromPeriod ?? new Date()),
            FchServHasta: formatDate(comprobante?.toPeriod ?? new Date()),
            FchVtoPago: formatDate(comprobante?.due_date ?? new Date()),
            ImpTotal: comprobante?.importe,
            ImpTotConc: 0,
            ImpNeto: (Number(comprobante?.importe) / (1 + ivaFloat)).toString(),
            ImpOpEx: 0,
            ImpIVA: (Number(comprobante?.importe) * ivaFloat).toString(),
            ImpTrib: 0,
            MonId: "PES",
            MonCotiz: 1,
            Iva: {
              Id: ivaId,
              BaseImp: 0,
              Importe: (Number(comprobante?.importe) * ivaFloat).toString(),
            },
            CbtesAsoc: {
              Tipo: comprobanteDictionary[
                fcAnc[comprobante.tipoComprobante ?? ""] ?? ""
              ],
              PtoVta: comprobante?.ptoVenta,
              Importe: comprobante?.nroComprobante,
            },
          };
          await db.insert(schema.events).values({
            current_amount: lastEventAmount + comprobante.importe,
            description: "NC",
            event_amount: comprobante.importe,
            currentAccount_id: cc?.id,
            type: "NC",
            comprobante_id: comprobante.id,
          });
          // AAACAAAA
          await preparedUpdatePayment.execute({
            comprobanteId: comprobante?.previous_facturaId,
            statusId: statusCancelado?.id,
          });
        } else {
          await db.insert(schema.payments).values({
            companyId:
              comprobante.family_group?.businessUnitData?.company?.id ?? "",
            invoice_number: comprobante?.nroComprobante,
            userId: user?.id ?? "",
            g_c: comprobante.family_group?.businessUnitData?.brand?.number ?? 0,
            name: billResponsible?.name ?? "",
            fiscal_id_type: billResponsible?.fiscal_id_type,
            fiscal_id_number: parseInt(
              billResponsible?.fiscal_id_number ?? "0"
            ),
            du_type: billResponsible?.id_type,
            du_number: parseInt(billResponsible?.id_number ?? "0"),
            product: producto?.id,
            affiliate_number:
              (comprobante.family_group?.plan?.plan_code ?? "") +
              (billResponsible?.id_number ?? ""),
            period: comprobante?.due_date,
            first_due_amount: comprobante?.importe,
            first_due_date: comprobante?.due_date,
            cbu: billResponsible?.pa[0]?.CBU,
            comprobante_id: comprobante?.id,
            documentUploadId: "0AspRyw8g4jgDAuNGAeBX",
            product_number: producto?.number ?? 0,
            statusId: status?.id,
            card_number: billResponsible?.pa[0]?.card_number,
            card_brand: billResponsible?.pa[0]?.card_brand,
            card_type: billResponsible?.pa[0]?.card_type,
          });

          data = {
            CantReg: 1, // Cantidad de comprobantes a registrar
            PtoVta: comprobante?.ptoVenta,
            CbteTipo: comprobanteCod?.toString() ?? "",
            Concepto: Number(comprobante?.concepto),
            DocTipo: comprobante?.tipoDocumento,
            DocNro: comprobante?.nroDocumento,
            CbteDesde: lastVoucher + 1,
            CbteHasta: lastVoucher + 1,
            CbteFch: parseInt(fecha?.replace(/-/g, "") ?? ""),
            FchServDesde: formatDate(comprobante?.fromPeriod ?? new Date()),
            FchServHasta: formatDate(comprobante?.toPeriod ?? new Date()),
            FchVtoPago: formatDate(comprobante?.due_date ?? new Date()),
            ImpTotal: comprobante?.importe,
            ImpTotConc: 0,
            ImpNeto: (Number(comprobante?.importe) / (1 + ivaFloat)).toString(),
            ImpOpEx: 0,
            ImpIVA: (Number(comprobante?.importe) * ivaFloat).toString(),
            ImpTrib: 0,
            MonId: "PES",
            MonCotiz: 1,
            Iva: {
              Id: ivaId,
              BaseImp: 0,
              Importe: (Number(comprobante?.importe) * ivaFloat).toString(),
            },
          };

          await db.insert(schema.events).values({
            current_amount: lastEventAmount - comprobante.importe,
            description: "FC",
            event_amount: comprobante.importe * -1,
            currentAccount_id: cc?.id,
            type: "FC",
            comprobante_id: comprobante.id,
          });
        }
        console.log(
          `[TIMING] Comprobante process (comprobante ${index}): ${
            Date.now() - processStart
          }ms`
        );

        const pdfGenerateStart = Date.now();
        const html = htmlBill(
          comprobante,
          comprobante.family_group?.businessUnitData!.company,
          producto,
          lastVoucher + 1,
          comprobante.family_group?.businessUnitData!.brand,
          billResponsible?.name ?? "",
          (billResponsible?.address ?? "") +
            " " +
            (billResponsible?.address_number ?? ""),
          billResponsible?.locality ?? "",
          billResponsible?.province ?? "",
          billResponsible?.postal_code?.cp ?? "",
          billResponsible?.fiscal_id_type ?? "",
          billResponsible?.fiscal_id_number ?? "",
          billResponsible?.afip_status ?? ""
        );

        const name = `FAC_${lastVoucher + 1}.pdf`; // NOMBRE        lastVoucher += 1;

        await PDFFromHtml(
          html,
          name,
          afip,
          comprobante?.id ?? "",
          lastVoucher + 1
        );
        console.log(
          `[TIMING] PDF generation (comprobante ${index}): ${
            Date.now() - pdfGenerateStart
          }ms`
        );
      });

    console.log(
      `[TIMING] Promise pool processing: ${Date.now() - promisePoolStart}ms`
    );
    console.log(`approbatecomprobante total ${Date.now() - start}ms`);
    return "OK";
  } else {
    return "Error";
  }
}

async function PDFFromHtml(
  html: string,
  name: string,
  afip: Afip,
  comprobanteId: string,
  voucher: number
) {
  const options = {
    width: 8, // Ancho de pagina en pulgadas. Usar 3.1 para ticket
    marginLeft: 0.4, // Margen izquierdo en pulgadas. Usar 0.1 para ticket
    marginRight: 0.4, // Margen derecho en pulgadas. Usar 0.1 para ticket
    marginTop: 0.4, // Margen superior en pulgadas. Usar 0.1 para ticket
    marginBottom: 0.4, // Margen inferior en pulgadas. Usar 0.1 para ticket
  };
  const res = await afip.ElectronicBilling.createPDF({
    html: html,
    file_name: name,
    options: options,
  });
  const upload = await utapi.uploadFilesFromUrl(res.file);

  // Verifica si 'upload' es un array o un objeto
  const uploadData = Array.isArray(upload) ? upload[0]?.data : upload?.data;

  await preparedCompBillLink.execute({
    billLink: uploadData?.url ?? res.file ?? "",
    estado: "pendiente",
    voucher,
    comprobanteId,
  });

  console.log("termino la funcion");
}
async function createcomprobanteItem(
  ivaFloat: number,
  comprobanteId: string,
  concept: string,
  amount: number
) {
  const abonoItem = await db
    .insert(schema.items)
    .values({
      concept: concept,
      amount: amount,
      iva: amount * ivaFloat - amount,
      total: amount * ivaFloat,
      comprobante_id: comprobanteId,
    })
    .returning();
  // console.log("Llegaron", concept, amount, ivaFloat, abonoItem);
}
async function getGroupAmount(grupo: grupoCompleto, date: Date) {
  let importe = 0;
  const preciosPasados = grupo.plan?.pricesPerCondition.filter(
    (price) => price.validy_date.getTime() <= date.getTime()
  );
  preciosPasados?.sort(
    (a, b) => b.validy_date.getTime() - a.validy_date.getTime()
  );
  if (preciosPasados) {
    const vigente = preciosPasados[0]?.validy_date;

    const precios = grupo.plan?.pricesPerCondition.filter(
      (x) => x.validy_date.getTime() === vigente?.getTime()
    );
    grupo.integrants?.forEach((integrant) => {
      if (integrant.birth_date != null) {
        const age = calcularEdad(integrant.birth_date);
        let precioIntegrante = precios?.find(
          (x) => integrant.relationship && x.condition == integrant.relationship
        )?.amount;

        if (precioIntegrante === undefined) {
          precioIntegrante =
            precios?.find(
              (x) => (x.from_age ?? 1000) <= age && (x.to_age ?? 0) >= age
            )?.amount ?? 0;
        }
        importe += precioIntegrante;
      }
    });
  }

  console.log("La casa", importe);
  return importe;
}
async function getGroupContribution(grupo: grupoCompleto) {
  let importe = 0;
  grupo.integrants?.forEach((integrant) => {
    if (integrant?.contribution?.amount) {
      const contributionIntegrante = integrant?.contribution?.amount ?? 0;
      importe += contributionIntegrante;
    }
  });
  return importe;
}
async function getDifferentialAmount(grupo: grupoCompleto, fechaPreliq: Date) {
  let importe = 0;
  grupo.integrants?.forEach((integrant) => {
    if (integrant.birth_date == null) return 0;
    const age = calcularEdad(integrant.birth_date);

    let precioIntegrante = grupo.plan?.pricesPerCondition
      ?.sort((a, b) => b.validy_date.getTime() - a.validy_date.getTime())
      .find(
        (x) =>
          integrant.relationship &&
          x.condition == integrant.relationship &&
          x.validy_date.getTime() <= fechaPreliq.getTime()
      )?.amount;

    if (precioIntegrante === undefined) {
      precioIntegrante =
        grupo.plan?.pricesPerCondition?.find(
          (x) => (x.from_age ?? 1000) <= age && (x.to_age ?? 0) >= age
        )?.amount ?? 0;
    }
    integrant?.differentialsValues.forEach((differential) => {
      const differentialIntegrante =
        differential.amount * (precioIntegrante ?? 0);
      importe += differentialIntegrante;
      console.log(
        "differentialIntegrante",
        differentialIntegrante,
        importe,
        differential.amount,
        precioIntegrante
      );
    });
  });
  return importe;
}
export async function getGruposForLiquidation(brandId: string, date: Date) {
  const family_group = await db.query.family_groups.findMany({
    where: eq(schema.family_groups.state, "ACTIVO"),
    with: {
      businessUnitData: {
        with: {
          brand: true,
          company: true,
        },
      },
      abonos: true,
      integrants: {
        with: {
          contribution: true,
          differentialsValues: true,
          pa: true,
          aportes_os: true,
        },
      },
      cc: {
        with: {
          events: true,
        },
      },
      comprobantes: {
        with: {
          payments: true,
          anterior: true,
        },
      },
      bonus: true,
      plan: {
        with: {
          pricesPerCondition: true,
        },
      },
      modo: true,
    },
  });
  const family_group_reduced = family_group.filter((family_group) => {
    return (
      family_group.businessUnitData?.brandId === brandId &&
      checkExistingBill(family_group.comprobantes, date)
    );
  });

  return family_group_reduced;
}
export const comprobantesRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const comprobantes = await db.query.comprobantes.findMany({
      with: {
        items: true,
        liquidations: true,
        family_group: {
          with: {
            integrants: {
              where: eq(schema.integrants.isBillResponsible, true),
              with: {
                postal_code: true,
              },
            },
            plan: true,
            cc: true,
            bonus: true,
          },
        },
      },
    });
    return comprobantes;
  }),
  listFacturas: protectedProcedure.query(async ({ ctx }) => {
    const comprobantes = await db.query.comprobantes.findMany({
      with: {
        items: true,
        family_group: {
          with: {
            integrants: {
              where: eq(schema.integrants.isBillResponsible, true),
              with: {
                postal_code: true,
              },
            },
            plan: true,
            cc: true,
            bonus: true,
          },
        },
      },
    });
    return comprobantes;
  }),
  get: protectedProcedure
    .input(
      z.object({
        comprobanteId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const comprobante = await db.query.comprobantes.findFirst({
        where: eq(schema.comprobantes.id, input.comprobanteId),
        with: {
          items: true,
          family_group: {
            with: {
              integrants: {
                with: {
                  pa: true,
                  postal_code: true,
                },
              },
              businessUnitData: {
                with: {
                  company: true,
                  brand: true,
                },
              },
            },
          },
        },
      });

      return comprobante;
    }),
  getGruposForLiquidation: protectedProcedure
    .input(z.object({ brandId: z.string(), date: z.date() }))
    .query(async ({ input }) => {
      const grupos = await getGruposForLiquidation(input.brandId, input.date);
      return grupos;
    }),

  getLastComprobante: protectedProcedure.query(async ({}) => {
    const ulticomprobante = await db.query.comprobantes.findFirst({
      where: eq(schema.comprobantes.origin, "Factura"),
      with: {
        items: true,
      },
    });
    return ulticomprobante;
  }),

  getComprobanteByEvent: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input }) => {
      const events = await db.query.events.findFirst({
        where: eq(schema.events.id, input.eventId),
        with: {
          comprobantes: true,
        },
      });
      if (!events?.comprobantes) {
        return [];
      } else {
        return events?.comprobantes;
      }
    }),
  getByEntity: protectedProcedure.query(async ({ ctx }) => {
    const bussinessUnits = await db.query.bussinessUnits.findMany({
      where: eq(schema.bussinessUnits.companyId, ctx.session.orgId!),
      with: {
        ls: {
          with: {
            comprobantes: true,
          },
        },
      },
    });
    let comprobantes = bussinessUnits.flatMap((bu) =>
      bu.ls.flatMap((ls) => ls.comprobantes)
    );
    return comprobantes;
  }),
  getByLiquidation: protectedProcedure
    .input(z.object({ liquidationId: z.string() }))
    .query(async ({ input }) => {
      const comprobantes = await db.query.comprobantes.findMany({
        where: eq(schema.comprobantes.liquidation_id, input.liquidationId),
        with: {
          items: true,
        },
      });
      return comprobantes;
    }),
  create: protectedProcedure
    .input(ComprobantesSchemaDB)
    .mutation(async ({ input, ctx }) => {
      const comprobante = await db
        .insert(schema.comprobantes)
        .values({ ...input })
        .returning();
      const comprobanteGotten = await db.query.comprobantes.findFirst({
        where: eq(schema.comprobantes.id, comprobante[0]?.id ?? ""),
        with: {
          family_group: {
            with: {
              integrants: {
                with: {
                  postal_code: true,
                },
              },
            },
          },
          items: true,
          payments: true,
        },
      });
      console.log("justo antes de crear payments");

      if (
        input.tipoComprobante?.toUpperCase() === "NOTA DE CREDITO A" ||
        input.tipoComprobante?.toUpperCase() === "NOTA DE CREDITO B"
      ) {
        console.log("entro NC ");
        const statusCancelado = await db.query.paymentStatus.findFirst({
          where: eq(schema.paymentStatus.code, "90"),
        });
        console.log("Encontro status");
        console.log(input);
        const res = await db
          .update(schema.payments)
          .set({
            statusId: statusCancelado?.id,
          })
          .where(
            eq(schema.payments.comprobante_id, input.previous_facturaId ?? "")
          );
        console.log("Actualizo payments");
      } else if (
        input.tipoComprobante?.toUpperCase() === "FACTURA A" ||
        input.tipoComprobante?.toUpperCase() === "FACTURA B"
      ) {
        console.log("entro FC ");
        const status = await db.query.paymentStatus.findFirst({
          where: eq(schema.paymentStatus.code, "91"),
        });
        console.log("Encontro status");
        const user = await currentUser();
        const family_group = await db.query.family_groups.findFirst({
          where: eq(
            schema.family_groups.id,
            comprobanteGotten?.family_group?.id ?? ""
          ),
          with: {
            businessUnitData: {
              with: {
                brand: true,
              },
            },
            plan: true,
          },
        });
        console.log("Encontro family_group");
        if (family_group) {
          const billResponsible = await db.query.integrants.findFirst({
            where: and(
              eq(
                schema.integrants.family_group_id,
                comprobanteGotten?.family_group?.id ?? ""
              ),
              eq(schema.integrants.isBillResponsible, true)
            ),
            with: {
              postal_code: true,
              pa: true,
            },
          });
          const producto = await db.query.products.findFirst({
            where: eq(
              schema.products.id,
              billResponsible?.pa[0]?.product_id ?? ""
            ),
          });
          console.log("Encontro producto");
          console.log("Entro?");

          const payment = await db
            .insert(schema.payments)
            .values({
              companyId: ctx.session.orgId ?? "",
              invoice_number: comprobanteGotten?.nroComprobante ?? 0,
              userId: user?.id ?? "",
              g_c: family_group?.businessUnitData?.brand?.number ?? 0,
              name: billResponsible?.name ?? "",
              fiscal_id_type: billResponsible?.fiscal_id_type,
              fiscal_id_number: parseInt(
                billResponsible?.fiscal_id_number ?? "0"
              ),
              du_type: billResponsible?.id_type,
              du_number: parseInt(billResponsible?.id_number ?? "0"),
              affiliate_number:
                (family_group?.plan?.plan_code ?? "") +
                (billResponsible?.id_number ?? ""),
              product: producto?.id,
              period: comprobanteGotten?.due_date,
              first_due_amount: comprobanteGotten?.importe,
              first_due_date: comprobanteGotten?.due_date,
              cbu: billResponsible?.pa[0]?.CBU,
              comprobante_id: comprobanteGotten?.id,
              documentUploadId: "0AspRyw8g4jgDAuNGAeBX",
              product_number: producto?.number ?? 0,
              statusId: status?.id,
              card_number: billResponsible?.pa[0]?.card_number,
              card_brand: billResponsible?.pa[0]?.card_brand,
              card_type: billResponsible?.pa[0]?.card_type,
              // address: billResponsible?.address,
            })
            .returning();
          console.log("Creo payment");
        }
      }
      return [comprobanteGotten];
    }),
  createManual: protectedProcedure
    .input(ComprobantesSchemaDB)
    .mutation(async ({ input }) => {
      const newProvider = await db
        .insert(schema.comprobantes)
        .values({ ...input })
        .returning();
      return newProvider;
    }),
  approvePreLiquidation: protectedProcedure
    .input(
      z.object({
        liquidationId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const response = await approbatecomprobante(input.liquidationId);
      // return response;
    }),
  createPreLiquidation: protectedProcedure
    .input(
      z.object({
        pv: z.string(),
        brandId: z.string(),
        dateDesde: z.date().optional(),
        dateHasta: z.date().optional(),
        dateDue: z.date().optional(),
        interest: z.number().optional(),
        logo_url: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // const user = input.user;
      const companyId = ctx.session.orgId;
      const grupos = await getGruposForLiquidation(
        input.brandId,
        input.dateDesde!
      );

      if (!grupos || grupos.length === 0) {
        return {
          error:
            "No se encuentran grupos familiares.\n Revise si no se creo una liquidacion para este periodo o si la marca es correcta.",
        };
      }

      const user = await currentUser();

      const brand = await db.query.brands.findFirst({
        where: eq(schema.brands.id, input.brandId),
      });

      const businessUnit = await db.query.bussinessUnits.findFirst({
        where: and(
          eq(schema.bussinessUnits.companyId, companyId ?? ""),
          eq(schema.bussinessUnits.brandId, input.brandId)
        ),
      });

      // console.log("Estop", bussinessUnits);

      const company = await db.query.companies.findFirst({
        where: eq(schema.companies.id, companyId ?? ""),
      });
      // const randomNumberLiq = Math.floor(Math.random() * (1000 - 10 + 1)) + 10;

      let number;
      const liquidations_counter =
        await db.query.liquidations_counter.findFirst({
          where: eq(schema.liquidations_counter.companies_id, companyId ?? ""),
        });

      if (!liquidations_counter) {
        const liquidations_counters = await db
          .insert(schema.liquidations_counter)
          .values({
            companies_id: companyId ?? "",
            number: 1,
          })
          .returning();

        number = liquidations_counters[0]?.number;
      } else {
        number = liquidations_counter.number + 1;
        await db.update(schema.liquidations_counter).set({
          number: number,
        });
      }

      const [liquidation] = await db
        .insert(schema.liquidations)
        .values({
          brandId: input.brandId,
          estado: "pendiente",
          cuit: company?.cuit ?? "",
          period: input.dateDesde,
          userCreated: user?.id ?? "",
          userApproved: "",
          number: number ?? 0,
          pdv: parseInt(input.pv),
          interest: input.interest,
          logo_url: input.logo_url,
          bussinessUnits_id: businessUnit?.id ?? "",
        })
        .returning();

      await preparateComprobante(
        grupos,
        input.dateDesde,
        input.dateHasta,
        input.dateDue,
        input.pv,
        liquidation!.id,
        input.interest ?? 0,
        user?.id ?? ""
      );
      return liquidation;
    }),
  change: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        ...ComprobantesSchemaDB.shape,
      })
    )
    .mutation(async ({ input: { id, ...input } }) => {
      const updatedProvider = await db
        .update(schema.comprobantes)
        .set(input)
        .where(eq(schema.comprobantes.id, id));
      return updatedProvider;
    }),
  addBillLinkAndNumberAndEstado: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        billLink: z.string(),
        number: z.number(),
        state: z.enum([
          "pendiente",
          "generada",
          "parcial",
          "anulada",
          "apertura",
        ]),
      })
    )
    .mutation(async ({ input: { id, billLink, number, state } }) => {
      const updatedProvider = await db
        .update(schema.comprobantes)
        .set({
          billLink: billLink,
          nroComprobante: number,
          estado: state,
        })
        .where(eq(schema.comprobantes.id, id));
      const updatedPayments = await db
        .update(schema.payments)
        .set({
          invoice_number: number,
        })
        .where(eq(schema.payments.comprobante_id, id));
      return updatedProvider;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        providerId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      db.delete(schema.comprobantes).where(
        eq(schema.comprobantes.id, input.providerId)
      );
    }),
});
export async function preparateComprobante(
  grupos: grupoCompleto[],
  dateDesde: Date | undefined,
  dateHasta: Date | undefined,
  dateVencimiento: Date | undefined,
  pv: string,
  liquidationId: string,
  interes: number,
  user: string
) {
  // const user = currentUser();
  let groupIds = grupos.map((grupo) => grupo.cc?.id ?? "");
  const events = await db.query.events.findMany({
    where: and(
      inArray(schema.events.currentAccount_id, groupIds),
      lt(schema.events.createdAt, new Date())
    ),
  });
  await Promise.all(
    grupos.map(async (grupo) => {
      // const grupo = grupos[i];
      // if (grupo) {
      //calculate iva

      let iva =
        ivaDictionary[Number(grupo.businessUnitData?.brand?.iva ?? 0) ?? 3];

      console.log("iva", iva, grupo.businessUnitData?.brand?.iva);
      let ivaFloat = (100 + parseFloat(iva ?? "0")) / 100;

      //calculate ppb
      const abono = await getGroupAmount(grupo, dateDesde!);
      //calculate bonification
      const today = new Date();
      const bonificacion =
        (parseFloat(
          grupo.bonus?.find(
            (bonus) =>
              (bonus.from === null && bonus.to === null) ||
              (bonus.from !== null &&
                bonus.to !== null &&
                today >= bonus.from &&
                today <= bonus.to)
          )?.amount ?? "0"
        ) *
          abono) /
        100;

      //calculate contribution
      const contribution = await getGroupContribution(grupo);

      //calculate differential_amount
      const differential_amount = await getDifferentialAmount(
        grupo,
        dateDesde!
      );
      let saldo = 0;
      //calculate saldo
      // let events = await db.query.events.findMany({
      //   where: eq(schema.events.currentAccount_id, grupo.cc?.id ?? ""),
      // });
      // events = events?.filter(
      //   (x) => x.createdAt.getTime() < new Date().getTime()
      // );
      if (
        events.filter((x) => x.currentAccount_id == grupo.cc?.id).length > 0
      ) {
        const lastEvent = events
          .filter((x) => x.currentAccount_id == grupo.cc?.id)
          .reduce((prev, current) => {
            return new Date(prev.createdAt) > new Date(current.createdAt)
              ? prev
              : current;
          });
        saldo = lastEvent.current_amount * -1;
      }

      //calculate interest
      let interest = 0;
      if (saldo > 0) interest = (interes / 100) * saldo;

      console.log("interes", interest);
      let mostRecentFactura;
      let ivaFloatAnterior = 1;
      let previous_bill = 0;
      if (grupo?.comprobantes.length > 0) {
        const listadoFac = grupo.comprobantes?.filter(
          (x) =>
            x.origin == "Factura" &&
            x.estado !=
              "generada" /* || x.origin == "Factura" && x.estado != "apertura" */
        );
        if (listadoFac.length > 0) {
          mostRecentFactura = listadoFac.reduce((prev, current) => {
            return prev.createdAt.getTime() > current.createdAt.getTime()
              ? prev
              : current;
          });
        }
      } else {
        mostRecentFactura = null;
      }

      if (mostRecentFactura) {
        ivaFloatAnterior =
          (100 + parseFloat(mostRecentFactura.iva ?? "0")) / 100;
        previous_bill = mostRecentFactura.importe;
      }

      console.log("mostRecentFactura", mostRecentFactura);
      console.log("previous_bill", previous_bill);

      const billResponsible = grupo.integrants.find(
        (integrant) => integrant.isBillResponsible
      );
      const tipoComprobante = getBillingData(billResponsible, grupo);

      const tipoDocumento = idDictionary[billResponsible?.fiscal_id_type ?? ""];

      const totalAportes = grupo.integrants
        .flatMap((part) => part.aportes_os)
        .filter((a) => a.contribution_date === dateDesde)
        .reduce((sum, aporte) => sum + parseInt(aporte.amount), 0);

      //calculate importe

      console.log("karabakskelia", totalAportes);
      const { amount: importe, ivaCodigo: ivaPostFiltro } =
        await calculateAmount(
          grupo,
          interest,
          ivaFloat,
          bonificacion,
          contribution,
          abono,
          differential_amount,
          totalAportes,
          previous_bill,
          saldo
        );
      if (ivaPostFiltro && ivaPostFiltro == "3") {
        ivaFloat = 1;
      }

      //creamos una NC virtual anulando la última factura si la ultima factura tiene importe
      if (
        previous_bill > 0 &&
        (mostRecentFactura?.estado == "pendiente" ||
          mostRecentFactura?.estado == "parcial" ||
          mostRecentFactura?.estado == "apertura")
      ) {
        let previousTipoComprobante =
          fcAnc[grupo.modo?.description == "MIXTO" ? "FACTURA B" : "FACTURA A"];

        switch (billResponsible?.afip_status?.toUpperCase()) {
          case "MONOTRIBUTISTA":
          case "RESPONSABLE INSCRIPTO":
            previousTipoComprobante = "FACTURA A";
          case "CONSUMIDOR FINAL":
            previousTipoComprobante = "FACTURA B";
        }

        if (
          mostRecentFactura &&
          mostRecentFactura.tipoComprobante &&
          mostRecentFactura.tipoComprobante !== "Apertura de CC"
        ) {
          previousTipoComprobante = fcAnc[mostRecentFactura.tipoComprobante];
        }
        const notaCredito = await db
          .insert(schema.comprobantes)
          .values({
            ptoVenta: mostRecentFactura.ptoVenta,
            nroComprobante: mostRecentFactura.nroComprobante,
            tipoComprobante: fcAnc[previousTipoComprobante ?? ""],
            concepto: mostRecentFactura?.concepto ?? 0,
            tipoDocumento: tipoDocumento ?? 0,
            generated: new Date(),
            nroDocumento: mostRecentFactura?.nroDocumento ?? 0,
            importe: previous_bill,
            fromPeriod: dateDesde,
            toPeriod: dateHasta,
            due_date: dateVencimiento,
            prodName: mostRecentFactura?.prodName ?? "",
            iva: mostRecentFactura?.iva ?? "",
            billLink: "",
            liquidation_id: liquidationId,
            family_group_id: grupo.id,
            origin: "Nota de credito",
            estado: "generada",
            previous_facturaId: mostRecentFactura?.id,
          })
          .returning();
        //creamos item de NC para visualizacion
        createcomprobanteItem(
          1,
          notaCredito[0]?.id ?? "",
          "Nota de credito",
          previous_bill
        );
      }

      //creamos FC nueva

      const comprobante = await db
        .insert(schema.comprobantes)
        .values({
          ptoVenta: parseInt(pv),
          generated: new Date(),
          nroComprobante: 0,
          tipoComprobante: tipoComprobante,
          concepto: parseInt(grupo.businessUnitData?.brand?.concept ?? "0"),
          tipoDocumento: tipoDocumento ?? 0,
          nroDocumento: parseInt(billResponsible?.fiscal_id_number ?? "0"),
          importe,
          fromPeriod: dateDesde,
          toPeriod: dateHasta,
          due_date: dateVencimiento,
          prodName: "Servicio",
          iva: ivaPostFiltro != "3" ? iva ?? "0" : "0",
          billLink: "",
          liquidation_id: liquidationId,
          family_group_id: grupo.id,
          origin: "Factura",
          estado: "generada",
        })
        .returning();
      //creamos items de fc para visualizacion
      createcomprobanteItem(ivaFloat, comprobante[0]?.id ?? "", "Abono", abono);
      if (bonificacion != 0) {
        createcomprobanteItem(
          ivaFloat,
          comprobante[0]?.id ?? "",
          "Bonificación",
          -1 * bonificacion
        );
      }
      if (contribution != 0) {
        createcomprobanteItem(
          ivaFloat,
          comprobante[0]?.id ?? "",
          "Aporte",
          -1 * contribution
        );
      }
      if (interest != 0) {
        createcomprobanteItem(
          ivaFloatAnterior,
          comprobante[0]?.id ?? "",
          "Interes",
          interest / ivaFloatAnterior
        );
      }
      if (differential_amount != 0) {
        createcomprobanteItem(
          ivaFloatAnterior,
          comprobante[0]?.id ?? "",
          "Diferencial",
          differential_amount
        );
      }
      if (previous_bill != 0) {
        createcomprobanteItem(
          ivaFloatAnterior,
          comprobante[0]?.id ?? "",
          "Factura Anterior",
          previous_bill / ivaFloatAnterior
        );
      }

      // createcomprobanteItem(
      //   ivaFloat,
      //   comprobante[0]?.id ?? "",
      //   "Diferencial",
      //   differential_amount
      // );
      // console.log(ivaFloat, comprobante[0]?.importe ?? "", "Total factura");
      createcomprobanteItem(
        ivaFloat,
        comprobante[0]?.id ?? "",
        "Total factura",
        (comprobante[0]?.importe ?? 0) / ivaFloat
      );

      // await createcomprobanteItem(
      //   ivaFloat,
      //   comprobante[0]?.id ?? "",
      //   "Total a pagar",
      //   (comprobante[0]?.importe ?? 0 + saldo)
      // );
      if (previous_bill - saldo > 0) {
        createcomprobanteItem(
          1,
          comprobante[0]?.id ?? "",
          "Saldo a favor",
          (previous_bill - saldo) * -1
        );
      }
    })
  );
  return "OK";
}
async function calculateAmount(
  grupo: grupoCompleto,
  interest: number,
  iva: number,
  bonificacion: number,
  contribution: number,
  abono: number,
  diferencial: number,
  previous_bill: number,
  saldo: number,
  totalAportes: number
) {
  let amount = 0;
  let ivaCodigo = null;
  const { modo } = grupo;

  if (!diferencial) {
    diferencial = 0;
  }
  if (!previous_bill) {
    previous_bill = 0;
  }

  if (modo?.description == "MIXTO") {
    iva = 1;
    ivaCodigo = "3";
  }
  if (modo?.description == "PRIVADO") {
    contribution = 0;
  }

  if (totalAportes) {
    console.log("joder, si llego", totalAportes);
  }
  console.log(
    "calculo de abono",
    abono,
    bonificacion,
    diferencial,
    previous_bill,
    saldo,
    iva,
    ivaCodigo,
    contribution,
    totalAportes
  );
  const precioNuevo = abono - bonificacion + diferencial + totalAportes;
  if (saldo > 0) {
    amount = (previous_bill + interest + precioNuevo) * iva - contribution;
  } else {
    amount = precioNuevo * iva - contribution;
  }

  console.log("papel", precioNuevo, amount, ivaCodigo);
  // if (modo?.description == "PRIVADO") {
  //   amount = saldo + interest + precioNuevo * iva;
  // }

  // if (modo?.description == "MIXTO") {
  //   amount = saldo + interest + precioNuevo - contribution;
  //
  // }

  return { amount, ivaCodigo };
}
function getBillingData(
  billResponsible:
    | {
        id: string;
        name: string | null;
        address: string | null;
        fiscal_id_type: string | null;
        fiscal_id_number: string | null;
        iva: string | null;
        family_group_id: string | null;
        state: string | null;
        id_type: string | null;
        id_number: string | null;
        afip_status: string | null;
        gender: "MASCULINO" | "FEMENINO" | "OTRO" | null;
        birth_date: Date | null;
        civil_status: "SOLTERO" | "CASADO" | "DIVORCIADO" | "VIUDO" | null;
        nationality: string | null;
        phone_number: string | null;
        cellphone_number: string | null;
        email: string | null;
        affiliate_type: string | null;
        relationship: string | null;
        address_number: string | null;
        floor: string | null;
        department: string | null;
        locality: string | null;
        partido: string | null;
        cp: string | null;
        zone: string | null;
        isHolder: boolean;
        isPaymentHolder: boolean;
        isAffiliate: boolean;
        isBillResponsible: boolean;
        age: number | null;
        affiliate_number: string | null;
        extention: string | null;
        postal_codeId: string | null;
        health_insuranceId: string | null;
        originating_health_insuranceId: string | null;
        pa: {
          id: string;
          card_brand: string | null;
          card_number: string | null;
          card_type: string | null;
          product_id: string | null;
          expire_date: Date | null;
          CCV: string | null;
          CBU: string | null;
          new_registration: boolean | null;
          integrant_id: string | null;
        }[];
        contribution: {
          id: string;
          amount: number;
          integrant_id: string | null;
          employerContribution: number;
          employeeContribution: number;
          cuitEmployer: string;
        } | null;
        differentialsValues: {
          id: string;
          createdAt: Date;
          amount: number;
          integrant_id: string | null;
          differentialId: string | null;
        }[];
      }
    | undefined,
  grupo: grupoCompleto
) {
  if (grupo.modo?.description == "MIXTO") {
    return "FACTURA B";
  }
  switch (billResponsible?.afip_status?.toUpperCase()) {
    case "MONOTRIBUTISTA":
    case "RESPONSABLE INSCRIPTO":
      return "FACTURA A";
    case "CONSUMIDOR FINAL":
      return "FACTURA B";
  }
  return "FACTURA A";
  // if (billResponsible) {
  //   if (billResponsible.iva) {
  //     iva = billResponsible.iva;
  //   }
  //   if (billResponsible.fiscal_id_type) {
  //     tipoComprobante = billResponsible.fiscal_id_type;
  //   }
  // }
  // return { tipoComprobante, iva };
}
function checkExistingBill(
  comprobantes: {
    id: string;
    createdAt: Date;
    generated: Date | null;
    ptoVenta: number;
    nroComprobante: number;
    tipoComprobante: string | null;
    concepto: number;
    tipoDocumento: number;
    nroDocumento: number;
    importe: number;
    fromPeriod: Date | null;
    toPeriod: Date | null;
    due_date: Date | null;
    payedDate: Date | null;
    prodName: string;
    iva: string;
    billLink: string;
    estado:
      | "generada"
      | "pendiente"
      | "pagada"
      | "parcial"
      | "anulada"
      | "apertura"
      | null;
    origin:
      | "anulada"
      | "apertura"
      | "Factura"
      | "Nota de credito"
      | "Recibo"
      | "Nota de debito"
      | null;
    liquidation_id: string | null;
    family_group_id: string | null;
    payments: {
      id: string;
      userId: string;
      name: string | null;
      companyId: string;
      createdAt: Date;
      updatedAt: Date | null;
      documentUploadId: string | null;
      responseDocumentId: string | null;
      g_c: number | null;
      fiscal_id_type: string | null;
      fiscal_id_number: number | null;
      du_type: string | null;
      du_number: number | null;
      product: string | null;
      product_number: number | null;
      invoice_number: number;
      period: Date | null;
      first_due_amount: number | null;
      first_due_date: Date | null;
      // second_due_amount: number | null;
      // second_due_date: Date | null;
      additional_info: string | null;
      payment_channel: string | null;
      payment_date: Date | null;
      collected_amount: number | null;
      cbu: string | null;
      card_brand: string | null;
      card_number: string | null;
      card_type: string | null;
      is_new: boolean;
      recollected_amount: number | null;
      statusId: string | null;
      outputFileId: string | null;
      genChannels: string[];
      comprobante_id: string | null;
    }[];
  }[],
  date: Date
) {
  console.log("date", date);
  console.log(
    "comprobantes",
    comprobantes.filter(
      (comprobante) => comprobante.fromPeriod?.getTime() == date.getTime()
    )
  );
  return !comprobantes.some(
    (comprobante) => comprobante.fromPeriod?.getTime() == date.getTime()
  );
  // return true;
}
