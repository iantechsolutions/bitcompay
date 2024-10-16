"use client";
import { Title } from "~/components/title";
import { api } from "~/trpc/react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import LayoutContainer from "~/components/layout-container";
import { Button } from "~/components/ui/button";
import { type TableRecord, columns } from "./columns";
import { Card } from "~/components/ui/card";
import Download02Icon from "~/components/icons/download-02-stroke-rounded";
import { RouterOutputs } from "~/trpc/shared";
import { formatCurrency } from "~/app/billing/pre-liquidation/[liquidationId]/detail-sheet";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "dayjs/locale/es";
import DataTable from "./data-table";
dayjs.locale("es");
export default function CCDetail(props: {
  params: { ccId: string; healthInsuranceId: string };
}) {
  const router = useRouter();
  const { data: events } = api.events.getByCC.useQuery({
    ccId: props.params.ccId,
  });
  const { data: healthInsurance } =
    api.healthInsurances.getWithComprobantes.useQuery({
      healthInsuranceId: props.params.healthInsuranceId,
    });
  const lastEvent = events?.reduce((prev, current) => {
    return new Date(prev.createdAt) > new Date(current.createdAt)
      ? prev
      : current;
  });
  const comprobantes = healthInsurance?.comprobantes;
  let lastComprobante;
  if (comprobantes && comprobantes?.length! > 0) {
    lastComprobante = comprobantes?.reduce((prev, current) => {
      return new Date(prev.due_date ?? 0) > new Date(current.due_date ?? 0)
        ? prev
        : current;
    });
  }
  const nextExpirationDate = lastComprobante?.due_date
    ? dayjs(lastComprobante?.due_date).format("DD-MM-YYYY")
    : "-";
  let comprobanteNCReciente = comprobantes?.find(
    (comprobante) => comprobante.origin === "Nota de credito"
  );
  let comprobanteFCReciente = comprobantes?.find(
    (comprobante) => comprobante.origin === "Factura"
  );

  let FCTotal = null;
  let NCTotal = null;
  if (comprobanteFCReciente) {
    FCTotal = comprobanteFCReciente.items.find(
      (item) => item.concept === "Total factura"
    )?.total;
  }
  if (comprobanteNCReciente) {
    NCTotal = comprobanteNCReciente.items.find(
      (item) => item.concept === "Nota de credito"
    )?.amount;
  }

  const total_a_pagar = comprobanteFCReciente?.items.find(
    (item) => item.concept == "Total a pagar"
  )?.total;
  let saldo_a_pagar = FCTotal;
  if (FCTotal && total_a_pagar) {
    saldo_a_pagar = FCTotal - total_a_pagar;
  }

  const comprobantesTable: RouterOutputs["comprobantes"]["getByLiquidation"] =
    [];
  if (comprobanteFCReciente) {
    comprobantesTable.push(comprobanteFCReciente);
  }
  if (comprobanteNCReciente) {
    comprobantesTable.push(comprobanteNCReciente);
  }
  const tableRows: TableRecord[] = [];
  if (events) {
    console.log("events", events);

    for (const event of events) {
      if (event.comprobantes) {
        tableRows.push({
          date: event.createdAt,
          description: event.description,
          amount: formatCurrency(event.event_amount),
          "Tipo comprobante":
            event.comprobantes?.tipoComprobante ?? "FACTURA A",
          comprobanteNumber:
            (event.comprobantes?.ptoVenta.toString().padStart(5, "0") ??
              "00000") +
            "-" +
            (event.comprobantes?.nroComprobante.toString().padStart(8, "0") ??
              "00000000"),
          Estado: "Pendiente",
          iva: Number(event.comprobantes?.iva ?? 0),
          comprobantes: comprobantesTable,
          currentAccountAmount: formatCurrency(NCTotal ?? 0),
          saldo_a_pagar: formatCurrency(saldo_a_pagar ?? 0),
          nombre: healthInsurance?.name ?? "",
          event: event,
        });
      } else {
        tableRows.push({
          date: event.createdAt,
          description: event.description,
          amount: formatCurrency(event.event_amount),
          "Tipo comprobante": "Apertura de CC",
          comprobanteNumber: "00000" + "-" + "00000000",
          Estado: "Pendiente",
          iva: 0,
          comprobantes: comprobantesTable,
          currentAccountAmount: formatCurrency(NCTotal ?? 0),
          saldo_a_pagar: formatCurrency(saldo_a_pagar ?? 0),
          nombre: healthInsurance?.name ?? "",
          event: event,
        });
      }
    }
  }
  async function handleExport() {
    const excelHeaders = [
      "Fecha",
      "Descripción",
      "Monto",
      "Tipo comprobante",
      "N° comprobante",
      "Estado",
      "IVA",
      "Saldo actual",
      "Saldo a pagar",
      "Nombre",
    ];
    const excelContent = [excelHeaders];
    for (const row of tableRows) {
      const rowData: string[] = Object.entries(row).reduce(
        (acc, [key, value]) => {
          if (key === "date") {
            acc.push(dayjs(value).format("DD/MM/YYYY"));
          } else if (key !== "event" && key !== "comprobantes") {
            acc.push(value.toString());
          }
          return acc;
        },
        [] as string[]
      );
      console.log("rowData", rowData, rowData.length);
      excelContent.push(rowData);
    }
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelContent);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const excelBuffer = XLSX.write(wb, {
      type: "array",
      bookType: "xlsx",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, `movimientos-cc-${healthInsurance?.identificationNumber}.xlsx`);
  }
  return (
    <LayoutContainer>
      <Title>Movimientos cuenta corriente</Title>
      <h2 className=" font-semibold mb-2">
        Obra social N° {healthInsurance?.identificationNumber}
      </h2>
      <div className="flex gap-3 mt-5 mb-10">
        <Card className="py-4 px-6 w-1/4 grid grid-cols-2 items-center">
          <div className="flex flex-col">
            <p className="text-base font-medium block">SALDO ACTUAL</p>

            {lastEvent?.current_amount !== undefined ? (
              <span
                className={`text-2xl font-bold ${
                  lastEvent.current_amount > 0
                    ? "text-[#6952EB]"
                    : lastEvent.current_amount < 0
                    ? "text-[#EB2727]"
                    : "text-black"
                }`}
              >
                {new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(lastEvent.current_amount)}
              </span>
            ) : (
              <span className={`text-2xl font-bold text-black`}>0.00</span>
            )}
          </div>
        </Card>
        <Card className="py-4 px-9 bg-[#DEF5DD] w-1/4 flex flex-col justify-center">
          <div className="flex flex-col  justify-center">
            <p className="text-sm font-medium block">PRÓXIMO VENCIMIENTO</p>
            <span className="text-[#3E3E3E] font-semibold text-xl">
              {nextExpirationDate}
            </span>
          </div>
        </Card>
      </div>
      <DataTable data={tableRows} columns={columns} />
      <div className="flex flex-auto justify-end">
        <Button
          variant="bitcompay"
          className=" text-base px-16 py-6 mt-5 gap-3 text-[#3e3e3e] rounded-full font-medium"
          onClick={async () => {
            await handleExport();
          }}
        >
          <Download02Icon />
          Exportar
        </Button>
      </div>
    </LayoutContainer>
  );
}
