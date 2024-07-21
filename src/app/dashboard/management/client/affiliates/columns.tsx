"use client";

import { ColumnDef } from "@tanstack/react-table";
import { RouterOutputs } from "~/trpc/shared";
import dayjs from "dayjs";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type AffiliatesTableRecord = {
  id: string;
  nroGF: number | string;
  nombre: string;
  cuil: string;
  integrantes: number;
  "Estados GF": string;
  fechaEstado: Date;
  Marca: string;
  Plan: string;
  UN: string;
  Modalidad: string;
};

export const columns: ColumnDef<AffiliatesTableRecord>[] = [
  {
    accessorKey: "id",
  },
  {
    accessorKey: "nroGF",
    header: () => (
      <div className="text-center text-black text-medium">NRO GF</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090]">
          {row.getValue("nroGF")}
        </div>
      );
    },
  },
  {
    accessorKey: "nombre",
    header: () => (
      <div className="text-center text-black text-medium">Apellido, Nombre</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090] overflow-hidden whitespace-nowrap text-overflow-ellipsis">
          {row.getValue("nombre")}
        </div>
      );
    },
  },
  {
    accessorKey: "cuil",
    header: () => (
      <div className="text-center text-black text-medium">CUIL</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090]">{row.getValue("cuil")}</div>
      );
    },
  },
  {
    accessorKey: "integrantes",
    header: () => (
      <div className="text-center text-black text-medium">Integrantes</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090]">
          {row.getValue("integrantes")}
        </div>
      );
    },
  },
  {
    accessorKey: "Estados GF",
    header: () => (
      <div className="text-center text-black text-medium">Estado</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090]">
          {row.getValue("Estados GF")}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "fechaEstado",
    header: () => (
      <div className="text-center text-black text-medium">Fecha Estado</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090]">
          {dayjs(row.getValue("fechaEstado")).format("DD/MM/YYYY")}
        </div>
      );
    },
  },
  {
    accessorKey: "Marca",
    header: () => null,
    cell: () => null,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "Plan",
    header: () => null,
    cell: () => null,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "UN",
    header: () => null,
    cell: () => null,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "Modalidad",
    header: () => null,
    cell: ({ row }) => {
      return null;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];
