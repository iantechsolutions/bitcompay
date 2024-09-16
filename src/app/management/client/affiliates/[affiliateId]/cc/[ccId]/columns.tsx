"use client";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { ChevronDown, ViewIcon, Printer, CircleCheck, CircleX, CalendarIcon } from "lucide-react";
import Edit02Icon from "~/components/icons/edit-02-stroke-rounded";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { ChangeEvent, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";import { cn } from "~/lib/utils";
import { FormControl, FormItem } from "~/components/ui/form";
import { date, datetime } from "drizzle-orm/mysql-core";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";



export type TableRecord = {
  date: Date;
  description: string;
  amount: number;
  comprobanteType: string;
  comprobanteNumber: string;
  status: "Pagada" | "Pendiente";
  iva: number;
};

export const AjustarDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [adjustType, setAdjustType] = useState<string | null>(null);
  const [concept, setConcept] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [fechaValidacion, setFechaValidacion] = useState<Date | null>(null);

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };
}; 
  

dayjs.extend(utc);
dayjs.locale("es");
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
            {row.getValue("comprobanteType")} - №{" "}
            {row.getValue("comprobanteNumber")}{" "}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "comprobanteType",
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
    accessorKey: "status",
    header: () => null,
    cell: ({ row }) => {
      const status = row.getValue("status");
      const style =
        status === "pagado"
          ? "bg-[#DDF9CC] text-[#4E9F1D]"
          : "bg-[#F9E7CC] text-[#F69709]";
      return (
        <div>
          <div
            className={`rounded-full inline-block font-bold ${style} px-7 py-1`}
          >
            {" "}
            {row.getValue("status")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => null,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        currencyDisplay: "narrowSymbol",
      }).format(amount);
      return (
        <div className="relative h-full flex flex-col justify-center items-center mx-10 mr-14">
          <div className="absolute top-1/2 transform -translate-y-1/2 font-bold">
            {formatted}
          </div>
          <div className="absolute top-1/2 transform translate-y-4 text-[#c4c4c4] text-xs">
            IVA: {(row.getValue("iva") as number) * 100} %
          </div>
        </div>
      );
    },
  },
  
    {
      id: "actions",
      cell: ({ row }) => {
        const handleDateChange = (newDate: Date | null) => {
          setFechaValidacion(newDate);
        };
        const [concept, setConcepto] = useState("");
        const [open, setOpen] = useState(false);
        const [typeAd, setAdjustType] = useState("");
        const [mes, setMes] = useState(0);
        const [selectedDate, setSelectedDate] = useState<Date | null>(null);
        const [currentVigency, setCurrentVigency] = useState(new Date(1, 1, 2000));
        const [concepto, setConcept] = useState<string | null>(null);
        const [amount, setAmount] = useState<string>("");
        const [user, setUser] = useState<string>("");
        const [popoverOpen, setPopoverOpen] = useState(false);

        const [fechaValidacion, setFechaValidacion] = useState<Date | null>(null);
        async function FechasCreate(e: any) {
          setFechaValidacion(e);
          setPopoverOpen(false);
        }
    


        function setTipoAjuste(value: string): void {
          throw new Error("Function not implemented.");
        }

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
                <DropdownMenuItem>
                  <ViewIcon className="mr-1 h-4" /> Ver
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Printer className="mr-1 h-4" /> Imprimir
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => setOpen(true)}>
                  <Edit02Icon className="mr-1 h-4" /> Ajustar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
    
            <Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-[600px] gap-4 m-4 rounded-2xl p-4">
  <DialogHeader className="p-2 ml-2 whitespace-nowrap">
      <div className="flex items-center">
        <Edit02Icon className="mr-1 h-3" />
        <DialogTitle className="whitespace-nowrap">Ajustes</DialogTitle>
      </div>
    </DialogHeader>
    <h1 className="text-xs block ml-2 pl-2">CUENTA CORRIENTE N° XXXX</h1>

    <div className="flex justify-between p-2">
      <div className="w-1/2 mr-2 ml-2 ">
        <Label htmlFor="validy_date" className="text-xs mb-2 block">
          FECHA
        </Label>
        <div className="relative">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                                  <PopoverTrigger asChild>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full border-green-300 justify-self-left border-0 border-b text-[#3E3E3E] bg-background rounded-none hover:bg-transparent",
                                !fechaValidacion && "text-muted-foreground"
                                        )}>
                                        <p>
                                        {fechaValidacion ? (
                                  dayjs.utc(fechaValidacion).format("D [de] MMMM [de] YYYY")
                                ) : (
                                  <span>Elegir una fecha</span>
                                )}
                                        </p>
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-auto p-0"
                                    align="start">
                                    <Calendar
                                      mode="single"
                                      selected={
                                        fechaValidacion
                                          ? new Date(fechaValidacion)
                                          : undefined
                                      }
                                      onSelect={(e) => FechasCreate(e)}
                                      disabled={(date: Date) =>
                                        date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                </div>
                                </div>

      <div className="w-1/2 pl-2 mr-2 ml-2">
        <Label htmlFor="tipo_ajuste" className="text-xs mb-2 block">
          TIPO DE AJUSTE
        </Label>
        <Select onValueChange={setTipoAjuste}>
          <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none ">
            <SelectValue placeholder="Seleccione uno" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Ajuste 1</SelectItem>
            <SelectItem value="2">Ajuste 2</SelectItem>
            <SelectItem value="3">Ajuste 3</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    
    <div className="flex justify-between mb-2 space-x-4 mr-1.5 ml-1.5">
      <div className="w-1/3 mr-1.5 ml-2 p-1">
        <Label htmlFor="concepto" className="text-xs mb-2 block">
          CONCEPTO
        </Label>
        <Select onValueChange={() => {}}>
          <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none ">
            <SelectValue placeholder="Seleccione uno" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="edad">Edad</SelectItem>
            <SelectItem value="compañia">Compañía</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-1/3 mr-2 ml-1.5 p-1">
        <Label htmlFor="importe" className="text-xs mb-2 block">
          IMPORTE
        </Label>
        <Input
          type="number"
          id="importe"
          className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
          placeholder="Ingrese importe"
        />
      </div>

      <div className="w-1/3 mr-2 ml-1.5 p-1 pl-3">
        <Label htmlFor="usuario" className="text-xs mb-2 block">
          USUARIO
        </Label>
        <Input
          type="text"
          id="usuario"
          className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
          placeholder="Ingrese usuario"
        />
      </div>
    </div>

    <DialogFooter className="flex justify-end space-x-4 p-3">
      <Button
        className="font-medium mb-2 rounded-full w-fit justify-items-end bg-[#BEF0BB] hover:bg-[#a6eca2] text-[#3E3E3E]"
        onClick={() => setOpen(false)}
      >
        <CircleCheck className="mr-2 text-[#3E3E3E] font-normal " />
        Registrar ajuste
      </Button>
      <Button
        className="font-medium mb-2 rounded-full w-fit justify-items-end bg-[#fda3a3] hover:bg-[#f77979] text-[#3E3E3E]"
        onClick={() => setOpen(false)}
      >
        <CircleX className="mr-2 text-[#3E3E3E] font-normal" />
        Cancelar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
    </>
  );
},
},
]