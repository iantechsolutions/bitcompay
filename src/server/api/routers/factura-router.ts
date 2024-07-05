import { desc, eq } from "drizzle-orm";
import Afip from "@afipsdk/afip.js";
import { z } from "zod";
import { db, schema } from "~/server/db";
import { FacturasSchemaDB } from "~/server/db/schema";
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

function formatDateAFIP(date: Date | undefined) {
  if (date) {
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return year + month + day;
  }
  return null;
}

type Bonus = {
  id: string;
  appliedUser: string;
  approverUser: string;
  validationDate: null | string;
  duration: string;
  amount: string;
  reason: string;
};

type grupoCompleto = RouterOutputs["facturas"]["getGruposByBrandId"][number];

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

const facturaDictionary = {
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

const NCbytipoFacturaDictionary: { [key: string]: string } = {
  "3": "8",
  "6": "13",
  "11": "15",
  "51": "52",
  "19": "20",
};

const idDictionary: { [key: string]: number } = {
  CUIT: 80,
  CUIL: 86,
  DNI: 96,
  "Consumidor Final": 99,
};

// async function generateFactura(
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
//   const numero_de_factura = last_voucher + 1;

//   const fecha = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
//     .toISOString()
//     .split("T")[0];

//   const data = {
//     CantReg: 1, // Cantidad de facturas a registrar
//     PtoVta: puntoVenta,
//     CbteTipo: facturaDictionary[grupo.businessUnitData?.brand?.bill_type ?? ""],
//     Concepto: conceptDictionary[grupo.businessUnitData?.brand?.concept],
//     DocTipo: billResponsible?.fiscal_id_type,
//     DocNro: billResponsible?.fiscal_id_number,
//     CbteDesde: numero_de_factura,
//     CbteHasta: numero_de_factura,
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
//    * Creamos la Factura
//    **/
//   const res = await afip.ElectronicBilling.createVoucher(data);
// }

async function approbateFactura(liquidationId: string) {
  const liquidation = await db.query.liquidations.findFirst({
    where: eq(schema.liquidations.id, liquidationId),
    with: {
      facturas: {
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
                  brand: true,
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

    for (let factura of liquidation?.facturas) {
      try {
        last_voucher = await afip.ElectronicBilling.getLastVoucher(
          factura?.ptoVenta,
          factura?.tipoFactura
        );
      } catch {
        last_voucher = 0;
      }
      const randomNumber =
        Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000;
      const billResponsible = factura.family_group?.integrants.find(
        (integrant) => integrant.isBillResponsible
      );
      const producto = await db.query.products.findFirst({
        where: eq(schema.products.id, billResponsible?.pa[0]?.product_id ?? ""),
      });
      const cc = await db.query.currentAccount.findFirst({
        where: eq(
          schema.currentAccount.family_group,
          factura.family_group?.id ?? ""
        ),
      });
      const status = await db.query.paymentStatus.findFirst({
        where: eq(schema.paymentStatus.code, "91"),
      });
      const payment = await db
        .insert(schema.payments)
        .values({
          companyId: factura.family_group?.businessUnitData?.company?.id ?? "",
          invoice_number: randomNumber,
          userId: user?.id ?? "",
          g_c: factura.family_group?.businessUnitData?.brand?.number ?? 0,
          name: billResponsible?.name ?? "",
          fiscal_id_type: billResponsible?.fiscal_id_type,
          fiscal_id_number: parseInt(billResponsible?.fiscal_id_number ?? "0"),
          du_type: billResponsible?.id_type,
          du_number: parseInt(billResponsible?.id_number ?? "0"),
          product: producto?.id,
          period: factura.due_date,
          first_due_amount: factura?.importe,
          first_due_date: factura.due_date,
          cbu: billResponsible?.pa[0]?.CBU,
          factura_id: factura?.id,
          documentUploadId: "0AspRyw8g4jgDAuNGAeBX",
          product_number: producto?.number ?? 0,
          statusId: status?.id,
          // address: billResponsible?.address,
        })
        .returning();

      const fecha = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];

      const listado = Object.entries(ivaDictionary).find(
        ([_, value]) => value === factura?.iva
      );
      const iva = listado ? listado[0] : "0";
      const ivaFloat = parseFloat(factura?.iva ?? "0") / 100;
      const data = {
        CantReg: 1, // Cantidad de facturas a registrar
        PtoVta: factura?.ptoVenta,
        CbteTipo: factura?.tipoFactura,
        Concepto: Number(factura?.concepto),
        DocTipo: factura?.tipoDocumento,
        DocNro: factura?.nroDocumento,
        CbteDesde: last_voucher + 1,
        CbteHasta: last_voucher + 1,
        CbteFch: parseInt(fecha?.replace(/-/g, "") ?? ""),
        FchServDesde: formatDate(factura?.fromPeriod ?? new Date()),
        FchServHasta: formatDate(factura?.toPeriod ?? new Date()),
        FchVtoPago: formatDate(factura?.due_date ?? new Date()),
        ImpTotal: factura?.importe,
        ImpTotConc: 0,
        ImpNeto: (Number(factura?.importe) / (1 + ivaFloat)).toString(),
        ImpOpEx: 0,
        ImpIVA: (Number(factura?.importe) * ivaFloat).toString(),
        ImpTrib: 0,
        MonId: "PES",
        MonCotiz: 1,
        Iva: {
          Id: iva,
          BaseImp: 0,
          Importe: (Number(factura?.importe) * ivaFloat).toString(),
        },
      };
      const html = htmlBill(
        factura,
        factura.family_group?.businessUnitData!.company,
        producto,
        last_voucher + 1
      );
      const name = `FAC_${last_voucher + 1}.pdf`; // NOMBRE
      last_voucher += 1;
      const options = {
        width: 8, // Ancho de pagina en pulgadas. Usar 3.1 para ticket
        marginLeft: 0.8, // Margen izquierdo en pulgadas. Usar 0.1 para ticket
        marginRight: 0.8, // Margen derecho en pulgadas. Usar 0.1 para ticket
        marginTop: 0.4, // Margen superior en pulgadas. Usar 0.1 para ticket
        marginBottom: 0.4, // Margen inferior en pulgadas. Usar 0.1 para ticket
      };

      //MANDAMOS PDF A AFIP, hay que agregar el qr al circuito, y levantar resHtml, por que actualmente solo se logea
      const resHtml = await afip.ElectronicBilling.createPDF({
        html: html,
        file_name: name,
        options: options,
      });

      console.log("resHtml", resHtml);
      const url = resHtml.file;

      // const uploaded = await utapi.uploadFiles(
      //   new File([text], input.fileName, { type: "text/plain" })
      // );

      await db
        .update(schema.facturas)
        .set({
          billLink: resHtml.file,
        })
        .where(eq(schema.facturas.id, factura.id));

      const historicEvents = await db.query.events.findMany({
        where: eq(schema.events.currentAccount_id, cc?.id ?? ""),
      });
      if (historicEvents && historicEvents.length > 0) {
        const lastEvent = historicEvents
          .filter(
            (x) => x.createdAt.getTime() < liquidation.createdAt.getTime()
          )
          .reduce((prev, current) => {
            return new Date(prev.createdAt) > new Date(current.createdAt)
              ? prev
              : current;
          });
        if (factura.origin === "Pago A Cuenta") {
          const event = await db.insert(schema.events).values({
            currentAccount_id: cc?.id,
            event_amount: factura.importe,
            current_amount: lastEvent.current_amount + factura.importe,
            description: "Re Balance Pago a cuenta",
            type: "FC",
          });
        }
        if (factura.origin === "Nota de credito") {
          const event = await db.insert(schema.events).values({
            currentAccount_id: cc?.id,
            event_amount: factura.importe,
            current_amount: lastEvent.current_amount + factura.importe,
            description: "Nota de credito factura anterior",
            type: "NC",
          });
        }
        if (factura.origin === "Original") {
        }
        const event = await db.insert(schema.events).values({
          currentAccount_id: cc?.id,
          event_amount: factura.importe * -1,
          current_amount: lastEvent.current_amount - factura.importe,
          description: "Factura aprobada",
          type: "FC",
        });
      } else {
        const event = await db.insert(schema.events).values({
          currentAccount_id: cc?.id,
          event_amount: factura.importe * -1,
          current_amount: 0 - factura.importe,
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

async function preparateFactura(
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
      const billResponsible = grupo.integrants.find(
        (integrant) => integrant.isBillResponsible
      );
      const iva =
        ivaDictionary[Number(grupo.businessUnitData?.brand?.iva) ?? 3];
      const ivaFloat = (100 + parseFloat(iva ?? "0")) / 100;
      const abono = await getGroupAmount(grupo, dateDesde!);
      const bonificacion =
        (parseFloat(
          grupo.bonus?.find((x) => {
            if (x.from == null || x.to == null) return x;
            return x.from <= new Date() && x.to >= new Date();
          })?.amount ?? "0"
        ) *
          abono) /
        100;

      const contribution = await getGroupContribution(grupo);
      const differential_amount = await getDifferentialAmount(grupo);

      let mostRecentFactura;
      let previous_bill = 0;
      let account_payment = 0;
      const events = await db.query.events.findMany({
        where: eq(schema.events.currentAccount_id, grupo.cc?.id ?? ""),
      });
      const lastEvent = events
        ?.filter((x) => x.createdAt.getTime() < new Date().getTime())
        .reduce((prev, current) => {
          return new Date(prev.createdAt) > new Date(current.createdAt)
            ? prev
            : current;
        });

      if (grupo?.facturas.length > 0) {
        const listadoFac = grupo.facturas?.filter(
          (x) => x.billLink && x.billLink != ""
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
        if (mostRecentFactura.payments.length > 0) {
          mostRecentFactura.payments.forEach((payment) => {
            account_payment += payment.recollected_amount ?? 0;
          });
        }
      }
      const tipoDocumento = idDictionary[billResponsible?.fiscal_id_type ?? ""];

      if (lastEvent.current_amount < 0) {
        const facturaPayment = await db
          .insert(schema.facturas)
          .values({
            ptoVenta: parseInt(pv),
            nroFactura: 0,
            tipoFactura: grupo.businessUnitData?.brand?.bill_type,
            concepto: parseInt(grupo.businessUnitData?.brand?.concept ?? "0"),
            tipoDocumento: tipoDocumento ?? 0,
            // tipoDocumento: 80,
            nroDocumento: parseInt(billResponsible?.fiscal_id_number ?? "0"),
            // nroDocumento: 0,
            importe: account_payment,
            fromPeriod: dateDesde,
            toPeriod: dateHasta,
            due_date: dateVencimiento,
            prodName: "Servicio",
            iva: iva ?? "",
            billLink: "",
            liquidation_id: liquidationId,
            family_group_id: grupo.id,
            origin: "Pago A Cuenta",
          })
          .returning();
        await createFacturaItem(
          ivaFloat,
          facturaPayment[0]?.id ?? "",
          "Pago A Cuenta",
          account_payment
        );
        const tipoFactura = grupo.businessUnitData?.brand?.bill_type ?? 0;
        const facturaNC = await db
          .insert(schema.facturas)
          .values({
            ptoVenta: parseInt(pv),
            nroFactura: 0,
            tipoFactura:
              NCbytipoFacturaDictionary[
                grupo.businessUnitData?.brand?.bill_type ?? "0"
              ],
            concepto: parseInt(grupo.businessUnitData?.brand?.concept ?? "0"),
            tipoDocumento: tipoDocumento ?? 0,
            // tipoDocumento: 80,
            nroDocumento: parseInt(billResponsible?.fiscal_id_number ?? "0"),
            // nroDocumento: 0,
            importe: previous_bill,
            fromPeriod: dateDesde,
            toPeriod: dateHasta,
            due_date: dateVencimiento,
            prodName: "Servicio",
            iva: iva ?? "",
            billLink: "",
            liquidation_id: liquidationId,
            family_group_id: grupo.id,
            origin: "Nota de credito",
          })
          .returning();
        await createFacturaItem(
          ivaFloat,
          facturaNC[0]?.id ?? "",
          "Nota de credito",
          previous_bill
        );
      }
      const interest = (interes / 100) * previous_bill;
      const importe =
        (abono - bonificacion + differential_amount - contribution) * ivaFloat +
        interest -
        account_payment;

      const factura = await db
        .insert(schema.facturas)
        .values({
          ptoVenta: parseInt(pv),
          nroFactura: 0,
          tipoFactura: grupo.businessUnitData?.brand?.bill_type,
          concepto: parseInt(grupo.businessUnitData?.brand?.concept ?? "0"),
          tipoDocumento: tipoDocumento ?? 0,
          // tipoDocumento: 80,
          nroDocumento: parseInt(billResponsible?.fiscal_id_number ?? "0"),
          // nroDocumento: 0,
          importe,
          fromPeriod: dateDesde,
          toPeriod: dateHasta,
          due_date: dateVencimiento,
          prodName: "Servicio",
          iva: iva ?? "",
          billLink: "",
          liquidation_id: liquidationId,
          family_group_id: grupo.id,
          origin: "Original",
        })
        .returning();
      await createFacturaItem(ivaFloat, factura[0]?.id ?? "", "Abono", abono);
      await createFacturaItem(
        ivaFloat,
        factura[0]?.id ?? "",
        "Bonificación",
        -1 * bonificacion
      );
      await createFacturaItem(
        ivaFloat,
        factura[0]?.id ?? "",
        "Diferencial",
        differential_amount
      );
      await createFacturaItem(
        ivaFloat,
        factura[0]?.id ?? "",
        "Aporte",
        -1 * contribution
      );
      await createFacturaItem(
        ivaFloat,
        factura[0]?.id ?? "",
        "Interes",
        interest
      );
      await createFacturaItem(
        ivaFloat,
        factura[0]?.id ?? "",
        "Factura Anterior",
        previous_bill
      );
      await createFacturaItem(
        ivaFloat,
        factura[0]?.id ?? "",
        "Pago",
        -1 * account_payment
      );
      const producto = await db.query.products.findFirst({
        where: eq(schema.products.id, billResponsible?.pa[0]?.product_id ?? ""),
      });

      const randomNumber =
        Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000;
      const status = await db.query.paymentStatus.findFirst({
        where: eq(schema.paymentStatus.code, "91"),
      });
    }
  }

  return "OK";
}

async function createFacturaItem(
  ivaFloat: number,
  facturaId: string,
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
      comprobante_id: facturaId,
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

        console.log(precioIntegrante);
        importe += precioIntegrante;
      }
    });
  }
  console.log(importe);
  return importe;
}

async function getGroupContribution(grupo: grupoCompleto) {
  let importe = 0;
  grupo.integrants?.forEach((integrant) => {
    if (integrant?.contribution?.amount) {
      const contributionIntegrante = integrant?.contribution?.amount ?? 0;
      console.log("contribution");
      console.log(contributionIntegrante);
      importe += contributionIntegrante;
    } else {
      importe += 0;
    }
  });
  console.log("importe");
  console.log(importe);
  return importe;
}

async function getDifferentialAmount(grupo: grupoCompleto) {
  let importe = 0;
  grupo.integrants?.forEach((integrant) => {
    if (integrant.birth_date == null) return;
    const age = calcularEdad(integrant.birth_date);

    let precioIntegrante = grupo.plan?.pricesPerCondition?.find(
      (x) => integrant.relationship && x.condition == integrant.relationship
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

async function getGruposByBrandId(brandId: string) {
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
      facturas: {
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

export const facturasRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({}) => {
    const facturas = await db.query.facturas.findMany({
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
    return facturas;
  }),
  get: protectedProcedure
    .input(
      z.object({
        facturaId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const factura = await db.query.facturas.findFirst({
        where: eq(schema.facturas.id, input.facturaId),
      });

      return factura;
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
      const facturas = await db.query.facturas.findMany({
        where: eq(schema.facturas.liquidation_id, input.liquidationId),
        with: {
          items: true,
        },
      });
      return facturas;
    }),
  create: protectedProcedure
    .input(FacturasSchemaDB)
    .mutation(async ({ input }) => {
      const newProvider = await db
        .insert(schema.facturas)
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
    .mutation(async ({ input }) => {
      const response = await approbateFactura(input.liquidationId);
      // return response;
    }),
  createPreLiquidation: protectedProcedure
    .input(
      z.object({
        pv: z.string(),
        companyId: z.string(),
        brandId: z.string(),
        dateDesde: z.date().optional(),
        dateHasta: z.date().optional(),
        dateDue: z.date().optional(),
        interest: z.number().optional(),
        logo_url: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log("DATE DESDE", input.dateDesde);
      const companyId = ctx.session.orgId;
      const grupos = await getGruposByBrandId(input.brandId);
      const user = await currentUser();
      const brand = await db.query.brands.findFirst({
        where: eq(schema.brands.id, input.brandId),
      });
      const company = await db.query.companies.findFirst({
        where: eq(schema.companies.id, input.companyId),
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
      await preparateFactura(
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
        ...FacturasSchemaDB.shape,
      })
    )
    .mutation(async ({ input: { id, ...input } }) => {
      const updatedProvider = await db
        .update(schema.facturas)
        .set(input)
        .where(eq(schema.facturas.id, id));
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
        .delete(schema.facturas)
        .where(eq(schema.facturas.id, input.providerId));
    }),
});
