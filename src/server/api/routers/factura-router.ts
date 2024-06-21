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
import { calcularEdad } from "~/lib/utils";

function formatDateAFIP(date: Date | undefined) {
  if (date) {
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return year + month + day;
  }
  return null;
}

export async function ingresarAfip() {
  const taxId = 23439214619;
  const cert =
    "-----BEGIN CERTIFICATE-----\nMIIDQzCCAiugAwIBAgIIBDcBTy1RV9IwDQYJKoZIhvcNAQENBQAwMzEVMBMGA1UEAwwMQ29tcHV0\nYWRvcmVzMQ0wCwYDVQQKDARBRklQMQswCQYDVQQGEwJBUjAeFw0yNDA1MTQxMjQ1NTZaFw0yNjA1\nMTQxMjQ1NTZaMC4xETAPBgNVBAMMCGFmaXBzZGsyMRkwFwYDVQQFExBDVUlUIDIzNDM5MjE0NjE5\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv2gtWDrfV7m9Lz1dYFimDivBff/UCrBB\nQHUuREfIcwL3cs0TDQ075Nk6GyPIIclvVBAUrIXHNDAEgLM3uxY/eSNO/kL9OpjTbleSNUxPyfZz\nwbFsS93ZZb37iA72J2ffgS8TRT9q0tiDnx5dUBv+lVIBliwbxGR6qgEGvgLwZHy7oSKfiYXV8vuc\n+Dt5kNbBVEZTyYyhSMYrM80TcStVrMYuFAz4GJiJRR3g258tJAVARB2KU6tNdaeZ/dmkFzQF/kL8\n9SsIVXEj/8HuLK1qNPoY/qIyD35xqlBW5VYeQMlqRC87V/eKWXUCQM/O+wett6QzB4OGYwBwZYsE\nMNFqWQIDAQABo2AwXjAMBgNVHRMBAf8EAjAAMB8GA1UdIwQYMBaAFCsNL8jfYf0IyU4R0DWTBG2O\nW9BuMB0GA1UdDgQWBBSqnCsGiIw8kqJgF80pSpuLASPB/zAOBgNVHQ8BAf8EBAMCBeAwDQYJKoZI\nhvcNAQENBQADggEBAJQMwlkuNIan9Em48HBUG03glquZsyF74uWLwBAXJ5KAoWHJDU8k1nsRLmw4\n4qw0jWpDPBX1kTvdYVq2412lndnXCdoBiOCjBibwApylqV3pZGyHDTfhWEYBBF+0TOLB/w2FVhSk\n7mbtmWTZ8twqJtORuBbolkM1QTWVuFCWRHX2wSINnjP23NxnLIf6CTJKdMUsAZ7YxAubuWIw3IYd\nGASuLrUCpAlyrA1jpGa3k1vBgTawt/9vWMrbX9uumefFRTM38xB+JPlIY5pN1vEOTreVfAyK7MGR\n1IH2RXkvV3n+YJkj+pcQZG5xOuYuLdeuki4jPy7Q/i3DlAhRYDONgDI=\n-----END CERTIFICATE-----";
  const key =
    "-----BEGIN RSA PRIVATE KEY-----\r\nMIIEpQIBAAKCAQEAv2gtWDrfV7m9Lz1dYFimDivBff/UCrBBQHUuREfIcwL3cs0T\r\nDQ075Nk6GyPIIclvVBAUrIXHNDAEgLM3uxY/eSNO/kL9OpjTbleSNUxPyfZzwbFs\r\nS93ZZb37iA72J2ffgS8TRT9q0tiDnx5dUBv+lVIBliwbxGR6qgEGvgLwZHy7oSKf\r\niYXV8vuc+Dt5kNbBVEZTyYyhSMYrM80TcStVrMYuFAz4GJiJRR3g258tJAVARB2K\r\nU6tNdaeZ/dmkFzQF/kL89SsIVXEj/8HuLK1qNPoY/qIyD35xqlBW5VYeQMlqRC87\r\nV/eKWXUCQM/O+wett6QzB4OGYwBwZYsEMNFqWQIDAQABAoIBAQCQFCct5wL/0fyq\r\ndpK3V4OH30ADTHOcqBg2IP72vuIQUQdbDytsA642EZ4/l6uqYyq+KGyngPv2OL7q\r\n8fzdg128Hev0URC07x0YTirsm8jjyfRQtPFEGnbusxeHz1tTRkljwL/MvHP4yqop\r\nOH4dMzVryRMQq5srNkdveN5OYX/64uxGM2uM+ZVXtMb7ve4KX5GZKCt2fyEC5ZTJ\r\n/B2i/by7NJtm3+VtiVrifi3U2oxjQ0Es1j9COBEWY8JtpIZw9PoP93Hb/zliipJW\r\nXRC6UGd7aF4KOi2vIt619dTD/jsRSweidNGluGdVfHkwQ2BIuLzepA4IU1Z6UKX2\r\nmu2NPXCRAoGBAN7zoRJmNeLf/i0xWHSkyhC3kKgV0wvICbXYVAFBCBEnM2p7Kx7v\r\nyIzQCg+qFtdqSh8Xv1hgo5hFP5QbiavCRbJa+Jb8ZPsqrmEhrE5HYoPamjRuSRi+\r\nzcH43O21fAX/eMhFl5g60i0svMP4hqhcVqli26Lt8iwvyKb83squ6c6XAoGBANvH\r\nhD2dVrRRcBC5+JOrJ2JKgGIqcX8TD9JKQqsHX6bytVUL4aOebgJqXHIBZPU8cRCx\r\nB+1dX5O8fjqkUNIWzq1IqAZtwZopjp1AGoctSzj9J3zYyjoK7AWaeDuyu2ZIzCef\r\nVat8k9Q1RdCovfhfQHZlV84+zJ7l8WWx0SFdpZyPAoGBAI5Mh2C79ebBOnTTyvZf\r\n+0xiLSTrERGy8merFCrcu+5ey9VJmcMcHi+p1NIcqImDIJ3pxUn+HExi3mqEjQEg\r\ndOWaZJHRtA4PNs9t85DexQUNMGEIhwUROzhzw2bA79DQNuH0cQZLfLwykqSt6hxp\r\nGzLvkunR30DOms3iFbzdmQMvAoGBAL/wP9JbnYQ+9yL0d13nhK63p+WTcalr6U5b\r\nIlwhRW0U3D5Y8Qcm7qZXY0MBar0tuwS7xtOKz1TDsm3eYOMJnhgBsxRiOEk9b9pv\r\nSHuzl9U+aYUEA6CrNzMxkz13u2f5vaoA4h2w353dpIo1RCssbKy5lvR9LdC7upV4\r\ntM5x7ZeLAoGAYs2nPABoUPrqKTOZmZg2ob0LKFnSxzFYNrxnIxyJN4CPbg5WJNFK\r\nUwOzB1oOezdIKBJ2eO7tidTa3DJ4HuMqvyChlnmQfL/98jCnnkwnVXldEfWwrKs/\r\npPiKvjFCOZROnwm3PhTfZtEi3Lpn6GNIy7rjl7eFOxgGGNCMkx34ehY=\r\n-----END RSA PRIVATE KEY-----\r\n";
  const afip = new Afip({
    access_token:
      "sjqzE9JPiq9EtrWQR0MSYjehQHlYGPLn7vdAEun9ucUQQiZ6gWV9xMJVwJd5aaSy",
    CUIT: taxId,
    cert: cert,
    key: key,
    production: true,
  });
  return afip;
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

const ivaDictionary = {
  "0%": 3,
  "10.5%": 4,
  "21%": 5,
  "27%": 6,
  "5%": 8,
  "2.5%": 9,
  "": 0,
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
    for (let factura of liquidation?.facturas) {
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

      const historicEvents = await db.query.events.findMany({
        where: eq(schema.events.currentAccount_id, cc?.id ?? ""),
      });
      if (historicEvents && historicEvents.length > 0) {
        const lastEvent = historicEvents.reduce((prev, current) => {
          return new Date(prev.createdAt) > new Date(current.createdAt)
            ? prev
            : current;
        });
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
  afip: Afip,
  grupos: grupoCompleto[],
  dateDesde: Date | undefined,
  dateHasta: Date | undefined,
  dateVencimiento: Date | undefined,
  pv: string,
  brandId: string,
  companyId: string,
  liquidationId: string
) {
  const user = await currentUser();

  grupos.forEach(async (grupo) => {
    const billResponsible = grupo.integrants.find(
      (integrant) => integrant.isBillResponsible
    );
    console.log("variables grupo");
    const ivaFloat =
      (100 + parseFloat(grupo.businessUnitData?.brand?.iva ?? "0")) / 100;
    console.log(ivaFloat);
    const abono = await getGroupAmount(grupo);
    console.log(abono);
    const bonificacion =
      (parseFloat(
        grupo.bonus?.find((x) => {
          if (x.from == null || x.to == null) return x;
          return x.from <= new Date() && x.to >= new Date();
        })?.amount ?? "0"
      ) *
        abono) /
      100;
    console.log(bonificacion);
    const interest = 0;
    const contribution = await getGroupContribution(grupo);
    console.log("contribution");
    console.log(contribution);
    const differential_amount = await getDifferentialAmount(grupo);

    let mostRecentEvent;
    if (grupo.cc && grupo.cc?.events.length > 0) {
      mostRecentEvent = grupo.cc?.events.reduce((prev, current) => {
        return new Date(prev.createdAt) > new Date(current.createdAt)
          ? prev
          : current;
      });
    } else {
      mostRecentEvent = null;
    }
    let previous_bill = 0;
    if (mostRecentEvent && mostRecentEvent.current_amount < 0) {
      previous_bill = mostRecentEvent?.current_amount ?? 0;
    }
    const importe =
      (abono -
        bonificacion +
        differential_amount -
        contribution -
        previous_bill) *
      ivaFloat;
    const items = await db
      .insert(schema.items)
      .values({
        abono,
        bonificacion,
        differential_amount,
        contribution,
        interest,
        previous_bill,
      })
      .returning();
    const tipoDocumento = idDictionary[billResponsible?.fiscal_id_type ?? ""];
    const producto = await db.query.products.findFirst({
      where: eq(schema.products.id, billResponsible?.pa[0]?.product_id ?? ""),
    });
    const factura = await db
      .insert(schema.facturas)
      .values({
        items_id: items[0]!.id ?? "",
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
        iva: grupo.businessUnitData?.brand?.iva ?? "",
        billLink: "",
        liquidation_id: liquidationId,
        family_group_id: grupo.id,
      })
      .returning();
    const randomNumber = Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000;
    const status = await db.query.paymentStatus.findFirst({
      where: eq(schema.paymentStatus.code, "91"),
    });
    console.log("numero", producto?.number);
  });
  return "OK";
}

async function getGroupAmount(grupo: grupoCompleto) {
  let importe = 0;
  grupo.integrants?.forEach((integrant) => {
    if (integrant.birth_date != null) {
      const age = calcularEdad(integrant.birth_date);
      console.log(age);
      console.log(integrant.relationship);
      const precioIntegrante =
        grupo.plan?.pricesPerAge.find((x) => {
          if (
            integrant.relationship &&
            integrant.relationship.toLowerCase() != "titular"
          ) {
            return x.condition == integrant.relationship;
          } else {
            return x.age == age;
          }
        })?.amount ?? 0;
      console.log(precioIntegrante);
      importe += precioIntegrante;
    }
  });
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
    const precioIntegrante =
      grupo.plan?.pricesPerAge.find((x) => {
        if (
          integrant.relationship &&
          integrant.relationship.toLowerCase() != "titular"
        ) {
          return x.condition == integrant.relationship;
        } else {
          return x.age == age;
        }
      })?.amount ?? 0;
    integrant?.differentialsValues.forEach((differential) => {
      const differentialIntegrante = differential.amount * precioIntegrante;
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
      bonus: true,
      plan: {
        with: {
          pricesPerAge: true,
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
            },
            plan: true,
            cc: true,
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
  create: protectedProcedure
    .input(FacturasSchemaDB)
    .mutation(async ({ input }) => {
      const newProvider = await db.insert(schema.facturas).values({ ...input });

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
      })
    )
    .mutation(async ({ input }) => {
      const grupos = await getGruposByBrandId(input.brandId);
      console.log("grupos", grupos);
      const afip = await ingresarAfip();
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
        })
        .returning();
      await preparateFactura(
        afip,
        grupos,
        input.dateDesde,
        input.dateHasta,
        input.dateDue,
        input.pv,
        input.brandId,
        input.companyId,
        liquidation!.id
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
