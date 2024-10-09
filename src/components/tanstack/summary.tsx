"use client";
import { Table } from "@tanstack/react-table";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { RouterOutputs } from "~/trpc/shared";
interface DataTableSummaryProps<TData> {
  summary: RouterOutputs["family_groups"]["getSummaryByLiqId"]["summary"];
}

export default function DataTableSummary<TData>({
  summary,
}: DataTableSummaryProps<TData>) {
  const summaryData = summary;

  Object.keys(summaryData).forEach((key) => {
    summaryData[key as keyof typeof summaryData] = parseFloat(
      summaryData[key as keyof typeof summaryData].toFixed(2)
    );
  });

  return (
    <ScrollArea className="w-full border rounded-lg py-5">
      <div className="flex flex-auto flex-row justify-center px-2 pb-0 w-max">
        {Object.entries(summaryData).map(([key, value], index, array) => (
          <div
            className={`${
              index != array.length - 1
                ? "flex flex-auto flex-col border-r border-[#f0f0f0] border-dashed px-6 last:pr-0 "
                : ""
            } px-2`}
            key={key}
          >
            <p className="font-medium whitespace-nowrap text-xs text-opacity-60 text-[#3e3e3e] uppercase">
              {key}
            </p>
            <p className="text-[#85CE81] whitespace-nowrap font-bold text-xs">
              {new Intl.NumberFormat("es-AR", {
                style: "currency",
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
                currency: "ARS",
              }).format(value)}
            </p>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
