"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { string } from "zod";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { clientStatuses } from "~/server/db/schema";
import { api } from "~/trpc/react";

export default function BreadcrumbComp(props: { pageName?: string }) {
  const pathname = usePathname();
  const pathnames = pathname.split("/").filter((x) => x && x !== "dashboard");

  // Mapeo de traducción de los segmentos de la ruta
  const breadcrumbMapping: Record<string, string> = {
    administration: "ADMINISTRACIÓN",
    brands: "MARCAS",
    channels: "CANALES",
    companies: "ENTIDADES",
    products: "PRODUCTOS",
    quotes: "COTIZACIONES",
    services: "SERVICIOS",

    audit: "AUDITORÍA",
    administrative: "ADMINISTRATIVO",
    benefits: "PRESTACIONES",
    fixed_eventual: "EVENTUALES/FIJOS",
    medical: "MÉDICO",
    operations: "OPERACIONES",
    telefonica: "TELEFÓNICA",

    billing: "FACTURACIÓN",
    consultations: "",
    consults: "CONSULTAS",
    information: "INFORMACIÓN",
    liquidation: "LIQUIDACIÓN",
    "pre-liquidation": "PRELIQUIDACIÓN",
    manual_issuance: "GENERACION MANUAL",

    maintenance: "MANTENIMIENTO",
    roles: "ROLES",
    tables: "TABLAS",
    user: "USUARIOS",

    management: "GESTIÓN",
    client: "CLIENTES",
    affiliates: "AFILIADOS",
    cc: "CUENTA CORRIENTE",
    health_insurances: "OBRAS SOCIALES",
    documents: "DOCUMENTOS",
    "masive-upload": "CARGA MASIVA",
    output: "ARCHIVOS DE SALIDA",
    "rec-upload": "CARGA REC",
    response: "RESPUESTA",
    sales: "VENTAS",
    advisors: "ASESORES",
    bonuses: "BONIFICACIONES",
    comissions: "COMISIONES",
    differentials: "DIFERENCIALES",
    plans: "PLANES",
    procedures: "TRÁMITES",
    suppliers: "PROVEEDORES",
    abm: "ABM",
    "comprobants-upload": "ALTA COMPROBANTES",
    currentAccounts: "CUENTAS CORRIENTES",
    due_dates: "AGENDA DE VENCIMIENTOS",
    orders: "ORDENES DE PAGO",

    treasury: "TESORERÍA",
    collection: "COBRANZAS",
    current_count: "CUENTA CORRIENTE",
    payments: "PAGOS",
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathnames.map((value, index) => {
          let translatedValue: string | null = null;
          translatedValue = breadcrumbMapping[value] || props.pageName || null;
          // const href = `/${pathnames.slice(1, index + 1).join("/")}`;
          let isLast = false;
          if (index === pathnames.length - 1) {
            isLast = true;
          } else if (
            !((pathnames[index + 1] ?? "") in breadcrumbMapping) &&
            !props.pageName
          ) {
            isLast = true;
          }

          return (
            <React.Fragment key={translatedValue}>
              <BreadcrumbItem>
                {breadcrumbUrlsMapping[value] ? (
                  <BreadcrumbLink asChild={true}>
                    <Link href={breadcrumbUrlsMapping[value]}>
                      {translatedValue}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>
                    {translatedValue}
                  </BreadcrumbPage>
                )}
              
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

const breadcrumbUrlsMapping: Record<string, string> = {
  brands: "/administration/brands",
  channels: "/administration/channels",
  companies: "/administration/companies",
  products: "/administration/products",

  administrative: "/audit/administrative",
  benefits: "/audit/benefits",
  fixed_eventual: "/audit/fixed_eventual",
  medical: "/audit/medical",
  operations: "/audit/operations",
  telefonica: "/audit/telefonica",

  liquidation: "/billing/liquidation",
  "pre-liquidation": "/billing/pre-liquidation",
  manual_issuance: "/billing/manual_issuance",

  roles: "/maintenance/roles",
  tables: "/maintenance/tables",
  user: "/maintenance/user",

  affiliates: "/management/client/affiliates",
  health_insurances: "/management/client/health_insurances",
  "massive-upload": "/management/documents/massive-upload",
  output: "/management/documents/output",
  "rec-upload": "/management/documents/rec-upload",
  response: "/management/documents/response",

  advisors: "/management/sales/advisors",
  bonuses: "/management/sales/bonuses",
  comissions: "/management/sales/comissions",
  differentials: "/management/sales/differentials",
  plans: "/management/sales/plans",
  procedures: "management/sales/procedures",

  abm: "/management/suppliers/abm",
  "comprobants-upload": "/management/suppliers/comprobants-upload",
  currentAccounts: "/management/suppliers/currentAccounts",
  due_dates: "/management/suppliers/due_dates",
  orders: "/management/suppliers/orders",

  collection: "/treasury/collection",
  payments: "/treasury/payments",
};
