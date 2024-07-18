"use client";

import { ColumnDef } from "@tanstack/react-table";
import { RouterOutputs } from "~/trpc/shared";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type TableRecord = {
  id: string;
  nroGF: number | string;
  nombre: string;
  cuit: string;
  "saldo anterior": number;
  "cuota pura": number;
  bonificacion: number;
  diferencial: number;
  aportes: number;
  interes: number;
  subtotal: number;
  iva: number;
  total: number;
  comprobantes: RouterOutputs["comprobantes"]["getByLiquidation"];
  currentAccountAmount: number;
};

export const columns: ColumnDef<TableRecord>[] = [
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
      <div className="text-center text-black text-medium">Nombre</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center text-[#909090]">
          {row.getValue("nombre")}
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
    accessorKey: "saldo anterior",
    header: () => (
      <div className="text-center text-black text-medium">Saldo anterior</div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("saldo anterior"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-center text-[#909090]">{formatted}</div>;
    },
  },
  {
    accessorKey: "cuota pura",
    header: () => (
      <div className="text-center text-black text-medium">Cuota pura</div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("cuota pura"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-center text-[#909090]">{formatted}</div>;
    },
  },
  {
    accessorKey: "bonificacion",
    header: () => (
      <div className="text-center text-black text-medium">Bonificación</div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("bonificacion"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-center text-[#909090]">{formatted}</div>;
    },
  },
  {
    accessorKey: "diferencial",
    header: () => (
      <div className="text-center text-black text-medium">Diferencial</div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("diferencial"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-center text-[#909090]">{formatted}</div>;
    },
  },
  {
    accessorKey: "aportes",
    header: () => (
      <div className="text-center text-black text-medium">Aportes</div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("aportes"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-center text-[#909090]">{formatted}</div>;
    },
  },
  {
    accessorKey: "interes",
    header: () => (
      <div className="text-center text-black text-medium">Interés</div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("interes"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-center text-[#909090]">{formatted}</div>;
    },
  },
  {
    accessorKey: "subtotal",
    header: () => (
      <div className="text-center text-black text-medium">Sub Total</div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("subtotal"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-center text-[#909090]">{formatted}</div>;
    },
  },
  {
    accessorKey: "iva",
    header: () => <div className="text-center text-black text-medium">IVA</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("iva"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-center text-[#909090]">{formatted}</div>;
    },
  },
  {
    accessorKey: "total",
    header: () => (
      <div className="text-center text-black text-medium">Total</div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-center text-[#909090]">{formatted}</div>;
    },
  },
];
