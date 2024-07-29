"use client";

import { ColumnDef } from "@tanstack/react-table";
import { RouterOutputs } from "~/trpc/shared";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type TableRecord = {
  id: string;
  number: number;
  Marca: string;
  period: string;
  cuit: string;
  UN: string;
};

export const columns: ColumnDef<TableRecord>[] = [
  {
    accessorKey: "number",
    header: () => (
      <div className="text-center text-black text-medium">Número preliq</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090]">
          {row.getValue("number")}
        </div>
      );
    },
  },
  {
    accessorKey: "Marca",
    header: () => (
      <div className="text-center text-black text-medium">Marca</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090]">
          {row.getValue("Marca")}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "period",
    header: () => (
      <div className="text-center text-black text-medium">Periodo</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090]">
          {row.getValue("period")}
        </div>
      );
    },
  },
  {
    accessorKey: "cuit",
    header: () => (
      <div className="text-center text-black text-medium">CUIL/CUIT</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090]">{row.getValue("cuit")}</div>
      );
    },
  },
  {
    accessorKey: "UN",
    header: () => (
      <div className="text-center text-black text-medium">
        Unidad de negocio
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090]">{row.getValue("UN")}</div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];
