// import {
//     Dialog,
//     DialogContent,
//     DialogFooter,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
//   } from "~/components/ui/dialog";
//   import { Label } from "~/components/ui/label";
//   import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
//   } from "~/components/ui/select";
//   import { Input } from "~/components/ui/input";
//   import { cn } from "~/lib/utils";
//   import { FormControl, FormItem } from "~/components/ui/form";
//   import { date, datetime } from "drizzle-orm/mysql-core";
//   import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
//   } from "~/components/ui/popover";
//   import { Calendar } from "~/components/ui/calendar";
//   import { Button } from "~/components/ui/button";
//   import Edit02Icon from "~/components/icons/edit-02-stroke-rounded";
//   import {
//     ChevronDown,
//     ViewIcon,
//     Printer,
//     CircleCheck,
//     CircleX,
//     CalendarIcon,
//   } from "lucide-react";
//   import dayjs from "dayjs";
//   import "dayjs/locale/es";
//   import utc from "dayjs/plugin/utc";
//   import { RouterOutputs } from "~/trpc/shared";
//   import { api } from "~/trpc/react";
//   import { useRouter } from "next/navigation";
//   import { useState } from "react";
//   import { toast } from "sonner";
//   import { asTRPCError } from "~/lib/errors";
//   import { TableRecord } from "../columns";

//   type DialogCCProps = {
//     open: boolean;
//     setOpen: (open: boolean) => void;
//     data?: TableRecord;
//   };

//   export default function DialogCC({ open, setOpen, data }: DialogCCProps) {

// if (!detailData) {
//     return toast.error("Error al descargar");
//   } else if (
//     !detailData.comprobantes ||
//     detailData.comprobantes.length === 0
//   ) {
//     return toast.error("No hay comprobantes disponibles para descargar");
//   } else {
//     const url =
//       "https://utfs.io/f/44838620-7323-4f58-816a-abf74035e972-sc8o5d";
//     if (!url) {
//       return toast.error("El enlace del comprobante no está disponible");
//     }

    setTimeout(() => {
      const link = document.createElement("a");
      link.href = url;
      link.download = "archivo.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
    return toast.success("PDF descargado con exito");
  }

  return (
    <Button
      onClick={downloadPDF}
      className="h-7 bg-[#BEF0BB] hover:bg-[#BEF0BB] text-[#3e3e3e] font-medium-medium text-sm rounded-2xl py-4 px-4 shadow-none">
      Descargar pdf
    </Button>
  );
}
