"use client";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import {
  ChevronDown,
  ViewIcon,
  Printer,
  CircleCheck,
  CircleX,
  CalendarIcon,
  Download,
} from "lucide-react";
import Edit02Icon from "~/components/icons/edit-02-stroke-rounded";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ChangeEvent, useState } from "react";
import DetailSheet from "./components_acciones/detail-sheet";
import DialogCC from "./components_acciones/dialog";
import { RouterOutputs } from "~/trpc/shared";
import { toast } from "sonner";
import { Span } from "next/dist/trace";

export type TableRecord = {
  date: Date;
  description: string;
  amount: string;
  "Tipo comprobante": string;
  comprobanteNumber: string;
  Estado: "Pagada" | "Pendiente";
  iva: number;
  comprobantes?: RouterOutputs["comprobantes"]["getByLiquidation"];
  currentAccountAmount: string;
  saldo_a_pagar: string;
  nombre: string;
  cuit: string;
  event: {
    id: string;
    description: string;
    createdAt: Date;
    comprobante_id: string | null;
    type: "NC" | "FC" | "REC" | null;
    currentAccount_id: string | null;
    event_amount: number;
    current_amount: number;
  } | null;
  // currentAccountNumber: string;
  [index: string]: any;
};

export const AjustarDialog = () => {
  // const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // const [adjustType, setAdjustType] = useState<string | null>(null);
  // const [concept, setConcept] = useState<string | null>(null);
  // const [amount, setAmount] = useState<string>("");
  // const [user, setUser] = useState<string>("");

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };
};

const print = () => {};

export const columns: ColumnDef<TableRecord>[] = [
  {
    accessorKey: "description",
    header: () => null,
    cell: ({ row }) => {
      return (
        <div className="relative h-20 flex flex-col justify-center w-96">
          <p className="absolute top-0 text-[#c4c4c4] text-xs">
            {" "}
            {dayjs(row.getValue("date")).format("D [de] MMMM ")}
          </p>
          <p className="font-bold text-sm absolute top-1/2 transform -translate-y-1/2">
            {" "}
            {row.getValue("description")}{" "}
          </p>
          <p className="text-[#c4c4c4] text-xs absolute top-1/2 transform translate-y-4">
            {" "}
            {row.getValue("Tipo comprobante")} - №{" "}
            {row.getValue("comprobanteNumber")}{" "}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "Tipo comprobante",
    header: () => null,
    cell: ({ row }) => {
      return null;
    },
  },
  {
    accessorKey: "comprobanteNumber",
    header: () => null,
    cell: ({ row }) => {
      return null;
    },
  },
  {
    accessorKey: "iva",
    header: () => null,
    cell: ({ row }) => {
      return null;
    },
  },
  {
    accessorKey: "Estado",
    header: () => null,
    cell: ({ row }) => {
      const Estado = row.getValue("Estado");
      const style =
        Estado === "pagado"
          ? "bg-[#DDF9CC] text-[#4E9F1D]"
          : "bg-[#F9E7CC] text-[#F69709]";
      return (
        <div>
          <div
            className={`rounded-full inline-block font-bold ${style} px-7 py-1`}
          >
            {" "}
            {row.getValue("Estado")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => null,
    cell: ({ row }) => {
      console.log("ivaRecibido");
      console.log(row.getValue("iva"));
      const ivaMostrar = (row.getValue("iva") as number).toString();

      let originalAmount = row.getValue("amount") as string;
      originalAmount = originalAmount
        .replace(/[$\s]/g, "")
        .replace(/\./g, "")
        .replace(/,/g, ".");
      const amount = parseFloat(originalAmount);
      console.log("originalAmount", originalAmount);
      console.log("das das", originalAmount);
      return (
        <div className="relative h-full flex flex-col justify-center items-center mx-10 mr-14">
          {amount === 0 ? (
            <span className="">{originalAmount}</span>
          ) : (
            <span
              className={`"absolute top-1/2 transform -translate-y-1/2 font-bold ${
                amount > 0 ? "text-[#6952EB]" : "text-[#EB2727]"
              }`}
            >
              {amount}
            </span>
          )}
          <div className="absolute top-1/2 transform translate-y-4 text-[#c4c4c4] text-xs flex flex-row gap-x-1">
            <div>IVA:</div>
            <div>{` ${ivaMostrar}%`}</div>
          </div>
        </div>
      );
    },
  },

  {
    id: "actions",

    cell: ({ row }) => {
      const [dialogOpen, setDialOpen] = useState(false);
      const [sheetOpen, setSheetOpen] = useState(false);
      const [detailData, setDetailData] = useState<TableRecord | null>(null);

      const handleMenuClick = () => {
        let detailData = row.original as TableRecord;

        console.log("detailData", detailData);
        setDetailData(detailData);
        setSheetOpen(!sheetOpen);
      };
      const handleMenuClickAjustar = () => {
        let detailData = row.original as TableRecord;

        setDetailData(detailData);
        setDialOpen(!dialogOpen);
      };

      const print = async () => {
        let detailData = row.original as TableRecord;

        setDetailData(detailData);
        console.log("Detail Data for Print:", detailData?.comprobantes);

        const comprobante = detailData?.comprobantes?.find(
          (comprobante) =>
            comprobante?.nroComprobante ===
            parseInt(detailData?.comprobanteNumber)
        );

        if (!detailData) {
          return toast.error("Error al descargar");
        } else if (!comprobante || !comprobante?.billLink) {
          return toast.error("No hay comprobantes disponibles para descargar");
        } else {
          const url = comprobante.billLink ?? "";
          const filename = comprobante.billLink ?? "";

          if (confirm("¿Desea descargar el archivo?")) {
            try {
              const response = await fetch(url);
              if (!response.ok) {
                throw new Error("Error en la descarga");
              }
              const blob = await response.blob();
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = filename;

              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
            } catch (error) {
              console.error("Error al descargar el archivo:", error);
              toast.error("Error al descargar el archivo");
            }
          }
        }
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="flex justify-between">
              <Button className="bg-[#f7f7f7] hover:bg-[#f7f7f7] rounded-xl p-0 text-[#3e3e3e] text-xs h-5 shadow-none px-4">
                Acciones
                <ChevronDown className="h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#f7f7f7] hover:bg-[#f7f7f7]">
              <DropdownMenuItem onClick={() => handleMenuClick()}>
                <ViewIcon className="mr-1 h-4" /> Ver
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => print()}>
                <Download className="mr-1 h-4" /> Descargar
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => handleMenuClickAjustar()}>
                <Edit02Icon className="mr-1 h-4" /> Ajustar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {detailData && (
            <div>
              <DetailSheet
                // liquidationId={detailData.id}
                open={sheetOpen}
                setOpen={setSheetOpen}
                data={detailData}
              />

              <DialogCC
                data={detailData}
                open={dialogOpen}
                setOpen={setDialOpen}
              />
            </div>
          )}
        </>
      );
    },
  },
];
