"use client";
import { Table } from "@tanstack/react-table";
interface DataTableSummaryProps<TData> {
  table: Table<TData>;
}

export default function DataTableSummary<TData>({
  table,
}: DataTableSummaryProps<TData>) {
  const summary = {
    "SALDO ANTERIOR": 0,
    "CUOTA PLANES": 0,
    BONIFICACIÓN: 0,
    DIFERENCIAL: 0,
    APORTES: 0,
    INTERÉS: 0,
    SUBTOTAL: 0,
    IVA: 0,
    "TOTAL A FACTURAR": 0,
  };

  const filteredRows = table.getFilteredRowModel().rows;
  for (const row of filteredRows) {
    summary["SALDO ANTERIOR"] += row.getValue("saldo anterior") as number;
    summary["CUOTA PLANES"] += row.getValue("cuota plan") as number;
    summary.BONIFICACIÓN += row.getValue("bonificacion") as number;
    summary.DIFERENCIAL += row.getValue("diferencial") as number;
    summary.APORTES += row.getValue("Aporte") as number;
    summary.INTERÉS += row.getValue("interes") as number;
    summary["TOTAL A FACTURAR"] += row.getValue("total") as number;
    summary.SUBTOTAL += row.getValue("subtotal") as number;
    summary.IVA += row.getValue("iva") as number;
  }
  Object.keys(summary).forEach((key) => {
    summary[key as keyof typeof summary] = parseFloat(summary[key as keyof typeof summary].toFixed(2));
  });
  return (
    <div className="flex flex-row border h-20 border-[#f2f2f2] overflow-x-scroll rounded-lg justify-stretch w-full p-4 ">
      {Object.entries(summary).map(([key, value], index, array) => (
        <div
          className={`${
            index != array.length - 1
              ? "border-r border-[#f2f2f2] border-dashed px-4"
              : ""
          } px-2`}
          key={key}
        >
          <p className="font-medium whitespace-nowrap text-xs text-opacity-60 text-[#3e3e3e] uppercase">{(key)}</p>
          <p className="text-[#85CE81] whitespace-nowrap font-bold text-xs">$ {value}</p>
        </div>
      ))}
    </div>
  );
}
