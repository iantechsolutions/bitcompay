// falta formatear fecha y hora, usuario
"use server";
import { currentUser } from "@clerk/nextjs/server";
import LayoutContainer from "~/components/layout-container";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "~/components/ui/sheet";
import TableRowContainer from "./table-row";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/tablePreliq";
import { Title } from "~/components/title";
import { type TableRecord, columns } from "./columns";
import { DataTable } from "./data-table";
import { api } from "~/trpc/server";
import dayjs from "dayjs";
import xlsx from "xlsx";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
dayjs.extend(utc);
dayjs.locale("es");

import { clerkClient } from "@clerk/nextjs/server";
import UpdateLiquidationEstadoDialog from "./approve-liquidation-dialog";
import { computeBase, computeIva } from "~/lib/utils";
import DownloadExcelButton from "./downloadExcelButton";
import RejectLiquidationDialog from "./reject-liquidation-dialog";
import { ChevronLeft, CircleX } from "lucide-react";
export default async function Home(props: {
  params: { liquidationId: string };
}) {
  const userActual = await currentUser();
  const companyData = await api.companies.get.query();
  const preliquidation = await api.liquidations.get.query({
    id: props.params.liquidationId,
  });
  const businessUnit = preliquidation?.bussinessUnits;
  const user = await clerkClient.users.getUser(
    preliquidation?.userCreated ?? "user_2iy8lXXdnoa2f5wHjRh5nj3W0fU"
  );
  // if (!preliquidation) return <Title>Preliquidacion no encotrada</Title>;
  const familyGroups = await api.family_groups.getByLiquidation.query({
    liquidationId: props.params.liquidationId,
  });

  const periodo =
    dayjs.utc(preliquidation?.period).format("MMMM [de] YYYY") ?? "-";
  const headers = [
    "NRO. GF",
    "Nombre",
    "CUIL/CUIT",
    "Saldo anterior",
    "Cuota Pura",
    "Bonificacion",
    "Diferencial",
    "Aportes",
    "Interes",
    "SubTotal",
    "IVA",
    "Total",
  ];
  if (preliquidation?.estado !== "pendiente") headers.push("Factura");
  const summary = {
    "Saldo anterior": 0,
    "Cuota Planes": 0,
    Bonificación: 0,
    Diferencial: 0,
    Aportes: 0,
    Interés: 0,
    "Sub Total": 0,
    IVA: 0,
    "Total a facturar": 0,
  };

  const toNumberOrZero = (value: any) => {
    const number = Number(value);
    return isNaN(number) ? 0 : number; // Check if the result is NaN (Not a Number)
  };
  const excelRows: (string | number)[][] = [[...headers]];
  const tableRows: TableRecord[] = [];
  for (const fg of familyGroups) {
    const excelRow = [];
    const billResponsible = fg?.integrants?.find(
      (integrante) => integrante?.isBillResponsible
    );
    const name = billResponsible?.name ?? "";
    const cuit = billResponsible?.id_number ?? "";
    excelRow.push(fg?.numericalId ?? "");
    excelRow.push(name);
    excelRow.push(cuit);
    const original_comprobante = fg?.comprobantes?.find(
      (comprobante) => comprobante?.origin?.toLowerCase() === "factura"
    );
    const saldo_anterior = toNumberOrZero(
      original_comprobante?.items.find(
        (item) => item.concept === "Saldo anterior"
      )?.amount
    );
    summary["Saldo anterior"] += saldo_anterior;
    excelRow.push(saldo_anterior);
    const cuota_planes = toNumberOrZero(
      original_comprobante?.items.find(
        (item) => item.concept === "Cuota Planes"
      )?.amount
    );
    summary["Cuota Planes"] += cuota_planes;
    excelRow.push(cuota_planes);
    const bonificacion = toNumberOrZero(
      original_comprobante?.items.find(
        (item) => item.concept === "Bonificación"
      )?.amount
    );
    summary["Bonificación"] += bonificacion;
    excelRow.push(bonificacion);
    const diferencial = toNumberOrZero(
      original_comprobante?.items.find((item) => item.concept === "Diferencial")
        ?.amount
    );
    summary["Diferencial"] += diferencial;
    excelRow.push(diferencial);
    const aportes = toNumberOrZero(
      original_comprobante?.items.find((item) => item.concept === "Aportes")
        ?.amount
    );
    summary["Aportes"] += aportes;
    excelRow.push(aportes);
    const interes = toNumberOrZero(
      original_comprobante?.items.find((item) => item.concept === "Interés")
        ?.amount
    );
    summary["Interés"] += interes;
    excelRow.push(interes);
    const total = toNumberOrZero(
      parseFloat(original_comprobante?.importe?.toFixed(2)!)
    );
    summary["Total a facturar"] += total;
    excelRow.push(total);
    const subTotal = computeBase(total, Number(original_comprobante?.iva!));
    summary["Sub Total"] += subTotal;
    excelRow.push(subTotal);
    const iva = computeIva(total, Number(original_comprobante?.iva!));
    summary.IVA += iva;
    excelRow.push(iva);
    excelRows.push(excelRow);
    const lastEvent = await api.events.getLastByDateAndCC.query({
      ccId: fg?.cc?.id!,
      date: preliquidation?.createdAt ?? new Date(),
    });
    const currentAccountAmount = lastEvent?.current_amount ?? 0;
    tableRows.push({
      id: fg?.id!,
      nroGF: fg?.numericalId ?? "N/A",
      nombre: name,
      cuit,
      "saldo anterior": saldo_anterior,
      "cuota plan": cuota_planes,
      bonificacion,
      diferencial,
      aportes,
      interes,
      subtotal: subTotal,
      iva,
      total,
      comprobantes: fg?.comprobantes!,
      currentAccountAmount,
    });
    console.log("comprobantes", fg?.comprobantes);
  }

  console.log("tableRows", tableRows);
  return (
    <LayoutContainer>
      <div className="flex flex-row justify-between w-full">
        {preliquidation?.estado === "pendiente" && (
          <>
            <div className="opacity-50 flex flex-row items-center">
              {" "}
              <ChevronLeft className="mr-1 h-4 w-auto" />
              <p className="font-medium ">VOLVER</p>
            </div>
            <div className="flex flex-row gap-1">
              <UpdateLiquidationEstadoDialog
                liquidationId={props.params.liquidationId}
                userId={userActual?.id ? userActual?.id : ""}
              />
              <RejectLiquidationDialog
                liquidationId={props.params.liquidationId}
              />
            </div>
          </>
        )}
      </div>
      <div className="grid grid-cols-3 gap-x-2 gap-y-2 ml-3 text-base opacity-50">
        <ul className="list-disc">
          <li>
            <span className="font-bold "> CUIT: </span>
            {companyData?.cuit ?? "-"}
          </li>
          <li className="opacity-70">
            <span className="font-bold ">Razon social: </span>
            {companyData?.razon_social ?? "-"}
          </li>
        </ul>
        <ul className="list-disc">
          <li>
            <span className="font-bold ">Gerenciador: </span>
            {businessUnit?.description ?? "-"}
          </li>
          <li>
            <span className="font-bold ">Periodo: </span>
            {periodo}
          </li>
        </ul>
        <ul className="list-disc">
          <li>
            <span className="font-bold opacity-100">Nro. Pre-liq: </span>
            {preliquidation?.number ?? "-"}
          </li>
          <li>
            <span className="font-bold opacity-100">Fecha: </span>
            {dayjs.utc(preliquidation?.createdAt).format("DD/MM/YYYY") ?? "-"}
          </li>
        </ul>
      </div>

      <div className="relative">
        <DataTable columns={columns} data={tableRows} />
        <DownloadExcelButton rows={excelRows} period={preliquidation?.period} />
      </div>
    </LayoutContainer>
  );
}
