"use client";
import { Table } from "@tanstack/react-table";
interface DataTableSummaryProps<TData> {
  table: Table<TData>;
}

export default function DataTableSummary<TData>({
  table,
}: DataTableSummaryProps<TData>) {
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

  const filteredRows = table.getFilteredRowModel().rows;
  for (const row of filteredRows) {
    summary["Saldo anterior"] += row.getValue("saldo anterior") as number;
    summary["Cuota Planes"] += row.getValue("cuota plan") as number;
    summary.Bonificación += row.getValue("bonificacion") as number;
    summary.Diferencial += row.getValue("diferencial") as number;
    summary.Aportes += row.getValue("Aporte") as number;
    summary.Interés += row.getValue("interes") as number;
    summary["Total a facturar"] += row.getValue("total") as number;
    summary["Sub Total"] += row.getValue("subtotal") as number;
    summary.IVA += row.getValue("iva") as number;
  }

  return (
    <div className="bg-[#EBFFFB] flex flex-row justify-stretch w-full pt-5 pb-1">
      {Object.entries(summary).map(([key, value], index, array) => (
        <div
          className={`${
            index != array.length - 1
              ? "border-r border-[#4af0d4] border-dashed grow"
              : ""
          } px-2`}
          key={key}
        >
          <p className="font-medium text-sm">{key}</p>
          <p className="text-[#4af0d4] font-bold text-[0.8rem]">$ {value}</p>
        </div>
      ))}
    </div>
  );
}
