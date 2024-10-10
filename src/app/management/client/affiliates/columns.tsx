"use client";

import { ColumnDef } from "@tanstack/react-table";
import { RouterOutputs } from "~/trpc/shared";
import dayjs from "dayjs";
import ActiveBadge from "src/components/active-badge";
import { stringify } from "querystring";

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
      <div className="text-center   whitespace-nowrap text-medium">N° GF</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center  ">
          {row.getValue("nroGF")}
        </div>
      );
    },
  },
  {
    accessorKey: "nombre",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">Nombre y apellido</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center capitalize overflow-hidden whitespace-nowrap text-overflow-ellipsis">
          {String(row.getValue("nombre")) &&
          (String(row.getValue("nombre")).toLowerCase())}
        </div>
      );
    },
  },
  {
    accessorKey: "cuil",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">CUIL</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center  ">{row.getValue("cuil")}</div>
      );
    },
  },
  {
    accessorKey: "integrantes",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium px-4">Integrantes</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center  ">
          {row.getValue("integrantes")}
        </div>
      );
    },
  },
  {
    accessorKey: "fechaEstado",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">Fecha de alta</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center px-4 ">
          {dayjs(row.getValue("fechaEstado")).format("DD/MM/YYYY")}
        </div>
      );
    },
  },
  {
    accessorKey: "Estados GF",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">Estado</div>
    ),
    cell: ({ row }) => {
      return ( 
        <div className="flex text-center mx-auto justify-center px-4">
          {(row.getValue("Estados GF") === "ACTIVO") && (
          <ActiveBadge className=""> Activo </ActiveBadge>
        ) || (row.getValue("Estados GF"))}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
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
