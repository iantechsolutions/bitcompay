import { desc, eq } from "drizzle-orm";
import Afip from "@afipsdk/afip.js";
import { z } from "zod";
import { db, schema } from "~/server/db";
import { ComprobantesSchemaDB } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Group } from "next/dist/shared/lib/router/utils/route-regex";
import { Plans } from "./plans-router";
import { Integrant } from "./integrant-router";
import { currentUser } from "@clerk/nextjs/server";
import { Brand } from "./brands-router";
import { RouterOutputs } from "~/trpc/shared";
import { calcularEdad, formatDate, htmlBill, ingresarAfip } from "~/lib/utils";
import { utapi } from "~/server/uploadthing";
import { id } from "date-fns/locale";
import { Events } from "./events-router";
import { datetime } from "drizzle-orm/mysql-core";

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
  RouterOutputs["comprobantes"]["getGruposByBrandId"][number];

const ivaDictionary: { [key: number]: string } = {
  3: "0",
  4: "10.5",
  5: "21",
  6: "27",
  8: "5",
  9: "2.5",
  0: "",
};

const conceptDictionary = {
  Productos: 1,
  Servicios: 2,
  "Productos y Servicios": 3,
  "": 0,
};

const comprobanteDictionary: { [key: string]: number } = {
  "FACTURA A": 3,
  "FACTURA B": 6,
  "FACTURA C": 11,
  "FACTURA M": 51,
  "FACTURA E": 19,
  "NOTA DE DEBITO A": 8,
  "NOTA DE DEBITO B": 13,
  "NOTA DE DEBITO C": 15,
  "NOTA DE DEBITO M": 52,
  "NOTA DE DEBITO E": 20,
  "NOTA DE CREDITO A": 2,
  "NOTA DE CREDITO B": 12,
  "NOTA DE CREDITO C": 14,
  "NOTA DE CREDITO M": 53,
  "NOTA DE CREDITO E": 21,
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

const NCbytipocomprobanteDictionarys: { [key: string]: string } = {
  "3": "2",
  "6": "12",
  "11": "14",
  "51": "53",
  "19": "21",
  "2": "3",
  "12": "6",
  "14": "11",
  "53": "51",
  "21": "19",
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

async function approbatecomprobante(liquidationId: string) {
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
                },
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
  if (liquidation?.estado === "pendiente") {
    const user = await currentUser();
    const updatedLiquidation = await db
      .update(schema.liquidations)
      .set({ estado: "aprobada", userApproved: user?.id })
      .where(eq(schema.liquidations.id, liquidationId));
    const afip = await ingresarAfip();
    let last_voucher;

    for (let comprobante of liquidation?.comprobantes) {
      console.log("0");
      const comprobanteCod =
        comprobanteDictionary[comprobante.tipoComprobante ?? ""];
      try {
        last_voucher = await afip.ElectronicBilling.getLastVoucher(
          comprobante?.ptoVenta,
          comprobanteCod
        );
      } catch {
        last_voucher = 0;
      }
      console.log("1");
      const randomNumber =
        Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000;
      const billResponsible = comprobante.family_group?.integrants.find(
        (integrant) => integrant.isBillResponsible
      );
      console.log("2");
      const producto = await db.query.products.findFirst({
        where: eq(schema.products.id, billResponsible?.pa[0]?.product_id ?? ""),
      });
      const cc = await db.query.currentAccount.findFirst({
        where: eq(
          schema.currentAccount.family_group,
          comprobante.family_group?.id ?? ""
        ),
      });
      console.log("3");
      const status = await db.query.paymentStatus.findFirst({
        where: eq(schema.paymentStatus.code, "00"),
      });
      console.log("4");
      const payment = await db
        .insert(schema.payments)
        .values({
          companyId:
            comprobante.family_group?.businessUnitData?.company?.id ?? "",
          invoice_number: randomNumber,
          userId: user?.id ?? "",
          g_c: comprobante.family_group?.businessUnitData?.brand?.number ?? 0,
          name: billResponsible?.name ?? "",
          fiscal_id_type: billResponsible?.fiscal_id_type,
          fiscal_id_number: parseInt(billResponsible?.fiscal_id_number ?? "0"),
          du_type: billResponsible?.id_type,
          du_number: parseInt(billResponsible?.id_number ?? "0"),
          product: producto?.id,
          period: comprobante.due_date,
          first_due_amount: comprobante?.importe,
          first_due_date: comprobante.due_date,
          cbu: billResponsible?.pa[0]?.CBU,
          comprobante_id: comprobante?.id,
          documentUploadId: "0AspRyw8g4jgDAuNGAeBX",
          product_number: producto?.number ?? 0,
          statusId: status?.id,
          // address: billResponsible?.address,
        })
        .returning();
      console.log("5");
      const fecha = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];

      const listado = Object.entries(ivaDictionary).find(
        ([_, value]) => value === comprobante?.iva
      );
      console.log("6");
      const iva = listado ? listado[0] : "0";
      const ivaFloat = parseFloat(comprobante?.iva ?? "0") / 100;
      let data = {};
      if (comprobante?.origin == "Nota de credito") {
        data = {
          CantReg: 1, // Cantidad de comprobantes a registrar
          PtoVta: comprobante?.ptoVenta,
          CbteTipo:
            NCbytipocomprobanteDictionarys[comprobanteCod?.toString() ?? ""],
          Concepto: Number(comprobante?.concepto),
          DocTipo: comprobante?.tipoDocumento,
          DocNro: comprobante?.nroDocumento,
          CbteDesde: last_voucher + 1,
          CbteHasta: last_voucher + 1,
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
            Id: iva,
            BaseImp: 0,
            Importe: (Number(comprobante?.importe) * ivaFloat).toString(),
          },
          CbtesAsoc: {
            Tipo: fcAnc[comprobante.tipoComprobante ?? ""],
            BaseImp: comprobante.importe / (1 + ivaFloat),
            Importe: comprobante.importe * ivaFloat,
          },
        };
      } else {
        data = {
          CantReg: 1, // Cantidad de comprobantes a registrar
          PtoVta: comprobante?.ptoVenta,
          CbteTipo: comprobanteCod,
          Concepto: Number(comprobante?.concepto),
          DocTipo: comprobante?.tipoDocumento,
          DocNro: comprobante?.nroDocumento,
          CbteDesde: last_voucher + 1,
          CbteHasta: last_voucher + 1,
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
            Id: iva,
            BaseImp: 0,
            Importe: (Number(comprobante?.importe) * ivaFloat).toString(),
          },
        };
      }

      console.log("7");
      const html = htmlBill(
        comprobante,
        comprobante.family_group?.businessUnitData!.company,
        producto,
        last_voucher + 1 ?? 0,
        comprobante.family_group?.businessUnitData!.brand
      );
      console.log("8");
      const name = `FAC_${last_voucher + 1}.pdf`; // NOMBRE
      last_voucher += 1;
      console.log("9");
      sendHTMLtoAFIP(html, name, afip, comprobante?.id ?? "");
      console.log("10");

      // const uploaded = await utapi.uploadFiles(
      //   new File([text], input.fileName, { type: "text/plain" })
      // );
      let historicEvents = await db.query.events.findMany({
        where: eq(schema.events.currentAccount_id, cc?.id ?? ""),
      });
      historicEvents = historicEvents.filter(
        (x) => x.createdAt.getTime() < liquidation.createdAt.getTime()
      );
      if (historicEvents && historicEvents.length > 0) {
        const lastEvent = historicEvents.reduce((prev, current) => {
          return new Date(prev.createdAt) > new Date(current.createdAt)
            ? prev
            : current;
        });
        if (comprobante.origin === "Nota de credito") {
          const event = await db.insert(schema.events).values({
            currentAccount_id: cc?.id,
            event_amount: comprobante.importe,
            current_amount: lastEvent.current_amount + comprobante.importe,
            description: "Nota de credito comprobante anterior",
            type: "NC",
          });
        }
        if (comprobante.origin === "Factura") {
          const event = await db.insert(schema.events).values({
            currentAccount_id: cc?.id,
            event_amount: comprobante.importe * -1,
            current_amount: lastEvent.current_amount - comprobante.importe,
            description: "Factura aprobadas",
            type: "FC",
          });
        }
      } else {
        const event = await db.insert(schema.events).values({
          currentAccount_id: cc?.id,
          event_amount: comprobante.importe * -1,
          current_amount: 0 - comprobante.importe,
          description: "Factura aprobada",
          type: "FC",
        });
      }
    }
    return "OK";
  } else {
    return "Error";
  }
}

async function sendHTMLtoAFIP(
  html: string,
  name: string,
  afip: Afip,
  comprobanteId: string
) {
  const options = {
    width: 8, // Ancho de pagina en pulgadas. Usar 3.1 para ticket
    marginLeft: 0.8, // Margen izquierdo en pulgadas. Usar 0.1 para ticket
    marginRight: 0.8, // Margen derecho en pulgadas. Usar 0.1 para ticket
    marginTop: 0.4, // Margen superior en pulgadas. Usar 0.1 para ticket
    marginBottom: 0.4, // Margen inferior en pulgadas. Usar 0.1 para ticket
  };

  const resHtml = await afip.ElectronicBilling.createPDF({
    html: html,
    file_name: name,
    options: options,
  });
  const url = resHtml.file;

  await db
    .update(schema.comprobantes)
    .set({
      billLink: resHtml.file,
      estado: "pendiente",
    })
    .where(eq(schema.comprobantes.id, comprobanteId));
  console.log("11");
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
    });
  });
  return importe;
}

export async function getGruposByBrandId(brandId: string) {
  const family_group = await db.query.family_groups.findMany({
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
    return family_group.businessUnitData?.brandId === brandId;
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
  getGruposByBrandId: protectedProcedure
    .input(z.object({ brandId: z.string() }))
    .query(async ({ input }) => {
      const grupos = await getGruposByBrandId(input.brandId);
      return grupos;
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
      const companyId = ctx.session.orgId;
      const grupos = await getGruposByBrandId(input.brandId);

      if (!grupos || grupos.length === 0) {
        return {
          error: "No se encuentran grupos familiares asociados a esa marca",
        };
      }

      const user = await currentUser();
      const brand = await db.query.brands.findFirst({
        where: eq(schema.brands.id, input.brandId),
      });
      const company = await db.query.companies.findFirst({
        where: eq(schema.companies.id, companyId!),
      });
      const randomNumberLiq = Math.floor(Math.random() * (1000 - 10 + 1)) + 10;

      const [liquidation] = await db
        .insert(schema.liquidations)
        .values({
          brandId: input.brandId,
          createdAt: new Date(),
          razon_social: brand?.razon_social ?? "",
          estado: "pendiente",
          cuit: company?.cuit ?? "",
          period: input.dateDesde,
          userCreated: user?.id ?? "",
          userApproved: "",
          number: randomNumberLiq,
          pdv: parseInt(input.pv),
          interest: input.interest,
          logo_url: input.logo_url,
        })
        .returning();
      await preparateComprobante(
        grupos,
        input.dateDesde,
        input.dateHasta,
        input.dateDue,
        input.pv,
        liquidation!.id,
        input.interest ?? 0
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

  delete: protectedProcedure
    .input(
      z.object({
        providerId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(schema.comprobantes)
        .where(eq(schema.comprobantes.id, input.providerId));
    }),
});

export async function preparateComprobante(
  grupos: grupoCompleto[],
  dateDesde: Date | undefined,
  dateHasta: Date | undefined,
  dateVencimiento: Date | undefined,
  pv: string,
  liquidationId: string,
  interes: number
) {
  const user = await currentUser();

  for (let i = 0; i < grupos.length; i++) {
    const grupo = grupos[i];
    if (grupo) {
      //calculate iva

      let iva =
        ivaDictionary[Number(grupo.businessUnitData?.brand?.iva ?? 0) ?? 3];

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
      let events = await db.query.events.findMany({
        where: eq(schema.events.currentAccount_id, grupo.cc?.id ?? ""),
      });
      events = events?.filter(
        (x) => x.createdAt.getTime() < new Date().getTime()
      );
      if (events && events.length > 0) {
        const lastEvent = events.reduce((prev, current) => {
          return new Date(prev.createdAt) > new Date(current.createdAt)
            ? prev
            : current;
        });
        saldo = lastEvent.current_amount * -1;
      }

      //calculate interest
      let interest = 0;
      if (saldo > 0) interest = (interes / 100) * saldo;

      let mostRecentFactura;
      let previous_bill = 0;
      if (grupo?.comprobantes.length > 0) {
        const listadoFac = grupo.comprobantes?.filter(
          (x) => x.origin == "Factura" && x.estado != "generada"
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
        previous_bill = mostRecentFactura.importe;
      }
      console.log("mostRecentFactura", mostRecentFactura);
      console.log("previous_bill", previous_bill);
      //calculate importe
      const { amount: importe, ivaCodigo: ivaPostFiltro } =
        await calculateAmount(
          grupo,
          interest,
          ivaFloat,
          bonificacion,
          contribution,
          abono,
          differential_amount,
          previous_bill,
          saldo
        );
      if (ivaPostFiltro && ivaPostFiltro == "3") {
        ivaFloat = 1;
      }
      const billResponsible = grupo.integrants.find(
        (integrant) => integrant.isBillResponsible
      );
      const tipoDocumento = idDictionary[billResponsible?.fiscal_id_type ?? ""];

      //creamos una NC virtual anulando la última factura si la ultima factura tiene importe
      if (
        previous_bill > 0 &&
        (mostRecentFactura?.estado == "pendiente" ||
          mostRecentFactura?.estado == "parcial")
      ) {
        const notaCredito = await db
          .insert(schema.comprobantes)
          .values({
            ptoVenta: mostRecentFactura.ptoVenta,
            nroComprobante: 0,
            tipoComprobante: fcAnc[mostRecentFactura?.tipoComprobante ?? "0"],
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
          })
          .returning();
        //creamos item de NC para visualizacion
        await createcomprobanteItem(
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
          tipoComprobante: grupo.businessUnitData?.brand?.bill_type,
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
      await createcomprobanteItem(
        ivaFloat,
        comprobante[0]?.id ?? "",
        "Abono",
        abono
      );
      await createcomprobanteItem(
        ivaFloat,
        comprobante[0]?.id ?? "",
        "Bonificación",
        -1 * bonificacion
      );
      await createcomprobanteItem(
        ivaFloat,
        comprobante[0]?.id ?? "",
        "Aporte",
        -1 * contribution
      );
      await createcomprobanteItem(
        1,
        comprobante[0]?.id ?? "",
        "Interes",
        interest
      );
      await createcomprobanteItem(
        1,
        comprobante[0]?.id ?? "",
        "Factura Anterior",
        previous_bill
      );
      await createcomprobanteItem(
        ivaFloat,
        comprobante[0]?.id ?? "",
        "Diferencial",
        differential_amount
      );
      await createcomprobanteItem(
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
        await createcomprobanteItem(
          1,
          comprobante[0]?.id ?? "",
          "Saldo a favor",
          (previous_bill - saldo) * -1
        );
      }
    }
  }

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
  saldo: number
) {
  let amount = 0;
  let ivaCodigo = null;
  const { modo } = grupo;

  if (modo?.description == "MIXTO") {
    iva = 1;
    ivaCodigo = "3";
  }
  if (modo?.description == "PRIVADO") {
    contribution = 0;
  }

  const precioNuevo = abono - bonificacion + diferencial;
  if (saldo > 0) {
    amount = (previous_bill + interest + precioNuevo) * iva - contribution;
  } else {
    amount = precioNuevo * iva - contribution;
  }

  // if (modo?.description == "PRIVADO") {
  //   amount = saldo + interest + precioNuevo * iva;
  // }

  // if (modo?.description == "MIXTO") {
  //   amount = saldo + interest + precioNuevo - contribution;
  //
  // }

  return { amount, ivaCodigo };
}
