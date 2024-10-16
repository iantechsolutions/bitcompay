"use client";

import { ColumnDef } from "@tanstack/react-table";
export type TableRecord = {
  id: string;
  name: string;
  identificationNumber: string;
  responsibleName: string;
  fiscal_id_number: string;
  "Estado AFIP": string;
};

export const columns: ColumnDef<TableRecord>[] = [
  {
    accessorKey: "identificationNumber",
    header: () => (
      <div className="text-center text-medium  ">
        N° identificación
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center  ">
          {row.getValue("identificationNumber")}
        </div>
      );
    },
  },
  {
    accessorKey: "responsibleName",
    header: () => (
      <div className="text-center text-medium">
        Nombre responsable
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center  ">
          {row.getValue("responsibleName")}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  {
    accessorKey: "fiscal_id_number",
    header: () => (
      <div className="text-center  text-medium">CUIL/CUIT</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center  ">
          {row.getValue("fiscal_id_number")}
        </div>
      );
    },
  },
  {
    accessorKey: "Estado AFIP",
    header: () => (
      <div className="text-center  text-medium">Estado AFIP</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center  ">
          {row.getValue("Estado AFIP")}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];
