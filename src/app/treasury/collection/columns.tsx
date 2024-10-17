"use client";

import { ColumnDef } from "@tanstack/react-table";

export type TableRecord = {
  name: string;
  // fiscal_id_number: string;
  // invoice_number: string;
  g_c: string;
  product_number: string;
  period: string;
  first_due_amount: string;
  first_due_date: string;
  additional_info: string;
  payment_date: string;
  // collected_amount: string;
  recollected_amount: string;
  statusId: string;
};

export const columns: ColumnDef<TableRecord>[] = [
  {
    accessorKey: "name",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        Apellido y Nombre
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("name")}</div>
    ),
  },
  // {
  //   accessorKey: "fiscal_id_number",
  //   header: () => (
  //     <div className="text-center whitespace-nowrap text-medium">
  //       Nro ID Fiscal
  //     </div>
  //   ),
  //   cell: ({ row }) => (
  //     <div className="text-center">{row.getValue("fiscal_id_number")}</div>
  //   ),
  // },
  // {
  //   accessorKey: "invoice_number",
  //   header: () => (
  //     <div className="text-center whitespace-nowrap text-medium">
  //       Nro Comprobante
  //     </div>
  //   ),
  //   cell: ({ row }) => (
  //     <div className="text-center">{row.getValue("invoice_number")}</div>
  //   ),
  // },
  {
    accessorKey: "g_c",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">Marca</div>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("g_c")}</div>,
  },
  {
    accessorKey: "product_number",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">Producto</div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("product_number")}</div>
    ),
  },
  {
    accessorKey: "period",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">Período</div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("period")}</div>
    ),
  },
  {
    accessorKey: "first_due_amount",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        Importe 1er Vto.
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("first_due_amount")}</div>
    ),
  },
  {
    accessorKey: "first_due_date",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        Fecha 1er Vto.
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("first_due_date")}</div>
    ),
  },
  {
    accessorKey: "additional_info",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        Info. Adicional
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("additional_info")}</div>
    ),
  },
  {
    accessorKey: "payment_date",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        Fecha de Pago/Débito
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("payment_date")}</div>
    ),
  },
  // {
  //   accessorKey: "collected_amount",
  //   header: () => (
  //     <div className="text-center whitespace-nowrap text-medium">
  //       Importe a cobrar
  //     </div>
  //   ),
  //   cell: ({ row }) => (
  //     <div className="text-center">{row.getValue("collected_amount")}</div>
  //   ),
  // },
  {
    accessorKey: "recollected_amount",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        Importe cobrado
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("recollected_amount")}</div>
    ),
  },
  {
    accessorKey: "statusId",
    header: () => (
      <div className="text-center whitespace-nowrap text-medium">
        Estado de Pago
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("statusId")}</div>
    ),
  },
];
