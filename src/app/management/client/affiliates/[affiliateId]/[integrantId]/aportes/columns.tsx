"use client";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { ChevronDown, ViewIcon, Printer, Download } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useState } from "react";
import { saveAs } from "file-saver";
import { formatNumberAsCurrency } from "~/lib/utils";
import { toast } from "sonner";

dayjs.locale("es");

export type TableRecord = {
  id: string;
  createdAt: Date;
  amount: string;
  id_affiliate: string;
  cuil: string;
  "Fecha de proceso": Date | null;
  "Fecha de contribución": Date | null;
  "Fecha de soporte": Date | null;
};

export const columns: ColumnDef<TableRecord>[] = [
  {
    accessorKey: "createdAt",
    header: "Fecha de creación",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as Date;
      return dayjs(createdAt).format("DD/MM/YYYY");
    },
  },
  {
    accessorKey: "amount",
    header: "Monto",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as string;
      return formatNumberAsCurrency(parseFloat(amount));
    },
  },
  {
    accessorKey: "Fecha de proceso",
    header: "Fecha de proceso",
    cell: ({ row }) => {
      const processDate = row.getValue("Fecha de proceso") as Date | null;
      return processDate ? dayjs(processDate).format("DD/MM/YYYY") : "N/A";
    },
  },
  {
    accessorKey: "Fecha de contribución",
    header: "Fecha de contribución",
    cell: ({ row }) => {
      const contributionDate = row.getValue(
        "Fecha de contribución"
      ) as Date | null;
      return contributionDate
        ? dayjs(contributionDate).format("DD/MM/YYYY")
        : "-";
    },
  },
  {
    accessorKey: "Fecha de soporte",
    header: "Fecha de soporte",
    cell: ({ row }) => {
      const supportDate = row.getValue("Fecha de soporte") as Date | null;
      return supportDate ? dayjs(supportDate).format("DD/MM/YYYY") : "-";
    },
  },
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const [detailData, setDetailData] = useState<TableRecord | null>(null);

  //     const handleMenuClick = () => {
  //       const detailData = row.original as TableRecord;
  //       setDetailData(detailData);
  //     };

  //     // const print = async () => {
  //     //   const detailData = row.original as TableRecord;
  //     //   setDetailData(detailData);
  //     //   const comprobantes = detailData?.comprobantes; // Assuming there's a `comprobantes` field
  //     //   if (!detailData || !comprobantes?.billLink) {
  //     //     return toast.error(
  //     //       "Error al descargar o no hay comprobantes disponibles."
  //     //     );
  //     //   }
  //     //   const url = comprobantes.billLink ?? "";
  //     //   if (confirm("¿Desea descargar el archivo?")) {
  //     //     try {
  //     //       const response = await fetch(url);
  //     //       if (!response.ok) throw new Error("Error en la descarga");
  //     //       const blob = await response.blob();
  //     //       saveAs(blob, "comprobante.pdf");
  //     //     } catch (error) {
  //     //       console.error("Error al descargar el archivo:", error);
  //     //       toast.error("Error al descargar el archivo");
  //     //     }
  //     //   }
  //     // };

  //     return (
  //       <>
  //         <DropdownMenu>
  //           <DropdownMenuTrigger asChild className="flex justify-between">
  //             <Button className="bg-[#f7f7f7] hover:bg-[#f7f7f7] rounded-xl p-0 text-[#3e3e3e] text-xs h-5 shadow-none px-4">
  //               Acciones
  //               <ChevronDown className="h-4" />
  //             </Button>
  //           </DropdownMenuTrigger>
  //           <DropdownMenuContent className="bg-[#f7f7f7] hover:bg-[#f7f7f7]">
  //             <DropdownMenuItem onClick={() => handleMenuClick()}>
  //               <ViewIcon className="mr-1 h-4" /> Ver
  //             </DropdownMenuItem>
  //             <DropdownMenuSeparator />
  //             {/* <DropdownMenuItem onClick={async () => await print()}>
  //               <Download className="mr-1 h-4" /> Descargar
  //             </DropdownMenuItem> */}
  //           </DropdownMenuContent>
  //         </DropdownMenu>
  //       </>
  //     );
  //   },
  // },
];
