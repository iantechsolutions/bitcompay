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
import { GoBackButton } from "~/components/goback-button";
export default async function Home(props: {
  params: { liquidationId: string };
}) {
  const userActual = await currentUser();
  const companyData = await api.companies.get.query();
  const eventos = await api.events.list.query();
  const preliquidation = await api.liquidations.get.query({
    id: props.params.liquidationId,
  });
  const businessUnit = preliquidation?.bussinessUnits;
  const user = await clerkClient.users.getUser(
    preliquidation?.userCreated ?? "user_2iy8lXXdnoa2f5wHjRh5nj3W0fU"
  );
  if (!preliquidation) return <Title>Preliquidacion no encotrada</Title>;
  const familyGroups = await api.family_groups.getByLiquidation.query({
    liquidationId: props.params.liquidationId,
  });

  // const fg = await api.family_groups.getWithFilteredComprobantes.query({

  // })

  // const allPlan = await api.plans.list.query();
  // const plansOptions = allPlan.map((plan) => ({
  //   value: plan.id,
  //   label: plan.plan_code ?? "plan sin nombre",
  // })) || [{ value: "", label: "" }];
  // const allModos = await api.modos.list.query();
  // const modosOptions = allModos.map((modo) => ({
  //   value: modo?.id,
  //   label: modo?.description ?? "modo sin nombre",
  // })) || [{ value: "", label: "" }];

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
    "Aporte",
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
    Aporte: 0,
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
    // const saldo_anterior = toNumberOrZero(
    //   original_comprobante?.items.find(
    //     (item) => item.concept === "Saldo anterior"
    //   )?.amount
    // );
    const eventPreComprobante = eventos.find(
      (x) =>
        x.currentAccount_id === fg?.cc?.id &&
        x.createdAt < preliquidation?.createdAt
    );
    summary["Saldo anterior"] += eventPreComprobante?.current_amount ?? 0;
    excelRow.push(eventPreComprobante?.current_amount ?? 0);
    const cuota_planes = toNumberOrZero(
      original_comprobante?.items.find((item) => item.concept === "Abono")
        ?.amount
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
    const Aporte = toNumberOrZero(
      original_comprobante?.items.find((item) => item.concept === "Aporte")
        ?.amount
    );
    summary["Aporte"] += Aporte;
    excelRow.push(Aporte);
    const interes = toNumberOrZero(
      original_comprobante?.items.find((item) => item.concept === "Interes")
        ?.amount
    );
    summary["Interés"] += interes;
    excelRow.push(interes);
    const total = toNumberOrZero(
      parseFloat(original_comprobante?.importe?.toFixed(2)!)
    );
    summary["Total a facturar"] += total;
    excelRow.push(total);
    const subTotal = computeBase(
      total,
      Number(original_comprobante?.iva ?? "0")
    );
    summary["Sub Total"] += subTotal;
    excelRow.push(subTotal);
    const iva = computeIva(total, Number(original_comprobante?.iva ?? "0"));
    summary.IVA += iva;
    excelRow.push(iva);
    excelRows.push(excelRow);
    // const lastEvent = await api.events.getLastByDateAndCC.query({
    //   ccId: fg?.cc?.id!,
    //   date: preliquidation?.createdAt ?? new Date(),
    // });
    const currentAccountAmount =
      // lastEvent?.current_amount ??
      0;
    const plan = fg?.plan?.description ?? "";
    const modo = fg?.modo?.description ?? "";
    tableRows.push({
      id: fg?.id!,
      nroGF: fg?.numericalId ?? "N/A",
      nombre: name,
      cuit,
      "saldo anterior":
        //  eventPreComprobante?.current_amount ??
        0,
      "cuota plan": cuota_planes,
      bonificacion,
      diferencial,
      Aporte,
      interes,
      subtotal: subTotal,
      iva,
      total,
      comprobantes: fg?.comprobantes!,
      currentAccountAmount,
      Plan: plan,
      modo,
    });
    console.log("comprobantes", fg?.comprobantes);
  }
  console.log("summary", summary);
  return (
    <LayoutContainer>
      <div className="flex flex-row justify-between w-full">
        {/* <GoBackButton url="/billing/liquidation" /> */}
        <Title>Liquidación</Title>
        {preliquidation?.estado === "pendiente" && (
          <>
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
      <div className="bg-[#f6f6f6] rounded-lg text-sm">
        <ul className="grid grid-cols-3 gap-x-2 gap-y-3 list-none px-8 py-5">
          <li className="">
            <span className="">RAZÓN SOCIAL</span>
            <br />
            <p className="font-medium">{companyData?.razon_social ?? "-"}</p>
          </li>
          <li>
            <span className="">CUIT</span>
            <br />
            <p className="font-medium">{companyData?.cuit ?? "-"}</p>
          </li>
          <li>
            <span className="">MARCA</span>
            <br />
            <p className="font-medium">XXXX</p>
          </li>
          <li>
            <span className="">PERÍODO</span>
            <br />
            <p className="font-medium">{periodo}</p>
          </li>
          <li>
            <span className="">N° PRE-LIQUIDACIÓN</span>
            <br />
            <p className="font-medium">{preliquidation?.number ?? "-"}</p>
          </li>
          <li>
            <span className="">FECHA DE PROCESO</span>
            <br />
            <p className="font-medium">
              {dayjs.utc(preliquidation?.createdAt).format("DD/MM/YYYY") ?? "-"}
            </p>
          </li>
          <li className="">
            <span className="">UNIDAD DE NEGOCIOS</span>
            <br />
            <p className="font-medium">XXXX</p>
          </li>
          <li>
            <span className="">FECHA DE EMISIÓN</span>
            <br />
            <p className="font-medium">XXXX</p>
          </li>
          <li>
            <span className="">VENCIMIENTOS</span>
            <br />
            <p className="font-medium">XXXX</p>
          </li>
          <li>
            <span className="">PDV</span>
            <br />
            <p className="font-medium">{preliquidation?.pdv ?? "-"}</p>
          </li>
          <li>
            <span className="">INTERÉS (%)</span>
            <br />
            <p className="font-medium">{preliquidation?.interest ?? "-"}</p>
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
