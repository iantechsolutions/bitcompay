"use client";

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

export default function BreadcrumbComp() {
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
    "pre-liquidation": "PRE-LIQUIDACIÓN",
    manual_issuance: "GENERAR MANUAL",

    maintenance: "MANTENIMIENTO",
    roles: "ROLES",
    tables: "TABLAS",
    user: "USUARIOS",

    management: "GESTIÓN",
    client: "CLIENTES",
    affiliates: "AFILIADOS",
    cc:"CUENTA CORRIENTE",
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
    "current-acounts": "CUENTAS CORRIENTES",
    due_dates: "AGENDA DE VENCIMIENTOS",
    orders: "ORDENES DE PAGO",

    treasury: "TESORERÍA",
    collection: "COBRANZAS",
    current_count: "CUENTA CORRIENTE",
    payments: "PAGOS",
  };
  let planDescription : string |null= null
  let indicePlanId : number |null= null;
  if(pathnames.includes("plans")){
    const indicePlans= pathnames.indexOf("plans")
    indicePlanId= indicePlans+1
    const planId= pathnames[indicePlanId]
    if (planId){
      //fetchear data from api
      const {data: plan} = api.plans.get.useQuery({planId: planId!})
      planDescription= plan?.description || null
    }
  }
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathnames.map((value, index) => {
          let translatedValue : string | null = null
          translatedValue = breadcrumbMapping[value] || null;
          if(index== indicePlanId){
            translatedValue= planDescription || null
          }
          // const href = `/${pathnames.slice(1, index + 1).join("/")}`;
          let isLast = false;
          if (index === pathnames.length - 1) {
            isLast = true;
          } else if (!((pathnames[index + 1] ?? "") in breadcrumbMapping) &&  !((index +1) == indicePlanId)) {
            isLast = true;
          }

          return (
            <React.Fragment key={translatedValue}>
              <BreadcrumbItem>
                <BreadcrumbPage>{translatedValue}</BreadcrumbPage>
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
