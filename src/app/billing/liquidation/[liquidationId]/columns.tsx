"use client";

import { ColumnDef } from "@tanstack/react-table";
import { RouterOutputs } from "~/trpc/shared";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type TableRecord = {
  id: string;
  nroGF: number | string;
  UN: string;
  nombre: string;
  cuit: string;
  "saldo anterior": number;
  "cuota plan": number;
  bonificacion: number;
  diferencial: number;
  Aporte: number;
  interes: number;
  subtotal: number;
  iva: number;
  total: number;
  comprobantes: RouterOutputs["comprobantes"]["getByLiquidation"];
  currentAccountAmount: number;
  Plan: string;
  modo: string;
};

export const columns: ColumnDef<TableRecord>[] = [
  {
    accessorKey: "nroGF",
    header: () => (
      <div className="text-center   whitespace-nowrap text-medium">N° GF</div>
    ),
    cell: ({ row }) => {
      return <div className="text-center  ">{row.getValue("nroGF")}</div>;
    },
  },
  {
    accessorKey: "nombre",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">Nombre</div>
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center   w-[100px] overflow-hidden whitespace-nowrap text-overflow-ellipsis">
          {row.getValue("nombre")}
        </div>
      );
    },
  },
  {
    accessorKey: "cuit",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">CUIL/CUIT</div>
    ),
    cell: ({ row }) => {
      return <div className="text-center  ">{row.getValue("cuit")}</div>;
    },
  },
  {
    accessorKey: "saldo anterior",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        Saldo anterior
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("saldo anterior"));
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        currencyDisplay: "narrowSymbol",
      }).format(amount);

      return <div className="text-center  ">{formatted}</div>;
    },
  },
  {
    accessorKey: "cuota plan",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        Cuota plan
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("cuota plan"));
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        currencyDisplay: "narrowSymbol",
      }).format(Math.abs(amount));

      return <div className="text-center  ">{formatted}</div>;
    },
  },
  {
    accessorKey: "bonificacion",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        Bonificación
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("bonificacion"));
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        currencyDisplay: "narrowSymbol",
      }).format(amount);

      return <div className="text-center  ">{formatted}</div>;
    },
  },
  {
    accessorKey: "diferencial",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        Diferencial
      </div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("diferencial"));
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        currencyDisplay: "narrowSymbol",
      }).format(amount);

      return <div className="text-center  ">{formatted}</div>;
    },
  },
  {
    accessorKey: "Aporte",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        Aportes</div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("Aporte"));
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        currencyDisplay: "narrowSymbol",
      }).format(amount);

      return <div className="text-center  ">{formatted}</div>;
    },
  },
  {
    accessorKey: "interes",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        Interés</div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("interes"));
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        currencyDisplay: "narrowSymbol",
      }).format(Math.abs(amount));

      return <div className="text-center  ">{formatted}</div>;
    },
  },
  {
    accessorKey: "subtotal",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        Sub Total</div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("subtotal"));
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        currencyDisplay: "narrowSymbol",
      }).format(amount);

      return <div className="text-center  ">{formatted}</div>;
    },
  },
  {
    accessorKey: "iva",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        IVA</div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("iva"));
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        currencyDisplay: "narrowSymbol",
      }).format(Math.abs(amount));

      return <div className="text-center  ">{formatted}</div>;
    },
  },
  {
    accessorKey: "total",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">Total</div>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"));
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        currencyDisplay: "narrowSymbol",
      }).format(amount);

      return <div className="text-center  ">{formatted}</div>;
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
    accessorKey: "modo",
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
    }
  }
];
