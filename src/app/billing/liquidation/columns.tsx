"use client";

import { ColumnDef } from "@tanstack/react-table";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type TableRecord = {
  id: string;
  number: string;
  Marca: string;
  period: string;
  processDate: string;
  UN: string;
  //user: string;
};

export const columns: ColumnDef<TableRecord>[] = [
  {
    accessorKey: "number",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">Nro.</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center  ">
          {row.getValue("number")}
        </div>
      );
    },
  },
  {
    accessorKey: "Marca",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">Marca</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center  ">
          {row.getValue("Marca")}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "UN",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        Unidad de negocio
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center  ">{row.getValue("UN")}</div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "period",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">Período</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center  ">
          {row.getValue("period")}
        </div>
      );
    },
  },
  {
    accessorKey: "processDate",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">Fecha de proceso</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center  ">{row.getValue("processDate")}</div>
      );
    },
  },
  // {
  //   accessorKey: "user",
  //   header: () => (
  //     <div className="text-center whitespace-nowrap text-medium">Usuario</div>
  //   ),
  //   cell: ({ row }) => {
  //     return (
  //       <div className="text-center  ">{row.getValue("user")}</div>
  //     );
  //   },
  // },
];
