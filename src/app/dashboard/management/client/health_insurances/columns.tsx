"use client";

import { ColumnDef } from "@tanstack/react-table";
export type TableRecord = {
  id: string;
  name: string;
  identificationNumber: string;
  responsibleName: string;
  fiscal_id_number: string;
  afip_status: string;
};

export const columns: ColumnDef<TableRecord>[] = [
  {
    accessorKey: "identificationNumber",
    header: () => (
      <div className="text-center text-black text-medium">
        Número Identificacion
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090]">
          {row.getValue("identificationNumber")}
        </div>
      );
    },
  },
  {
    accessorKey: "responsibleName",
    header: () => (
      <div className="text-center text-black text-medium">
        Nombre responsable
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090]">
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
      <div className="text-center text-black text-medium">CUIL/CUIT</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090]">
          {row.getValue("fiscal_id_number")}
        </div>
      );
    },
  },
  {
    accessorKey: "afip_status",
    header: () => (
      <div className="text-center text-black text-medium">Estado AFIP</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090]">
          {row.getValue("afip_status")}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];
