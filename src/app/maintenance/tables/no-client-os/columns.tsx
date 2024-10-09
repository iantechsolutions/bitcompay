"use client";

import { ColumnDef } from "@tanstack/react-table";
export type TableRecord = {
  id: string;
  name: string;
  identificationNumber: string;
  siglas: string;
  description:string;
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
    accessorKey: "siglas",
    header: () => (
      <div className="text-center text-medium">
        Siglas
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.getValue("siglas")}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "name",
    header: () => (
      <div className="text-center text-medium  ">
        Nombre/ razón social
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center  ">
          {row.getValue("name")}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: () => (
      <div className="text-center text-medium">
        Descripción
      </div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.getValue("siglas")}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

];
