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
  import { Button } from "~/components/ui/button";
import Edit02Icon from "~/components/icons/edit-02-stroke-rounded";
import { ChevronDown, ViewIcon, Printer, CircleCheck, CircleX, CalendarIcon } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";

type DialogCCProps = {
    open: boolean;
  setOpen: (open: boolean) => void;
};


export default function DialogCC ({ open, setOpen }: DialogCCProps){
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [concept, setConcepto] = useState("");
    const [typeAd, setAdjustType] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [currentVigency, setCurrentVigency] = useState(new Date(1, 1, 2000));
    const [concepto, setConcept] = useState<string | null>(null);
    const [amount, setAmount] = useState<string>("");
    const [user, setUser] = useState<string>("");
    const [fechaValidacion, setFechaValidacion] = useState<Date | null>(null);
    dayjs.extend(utc);
    dayjs.locale("es");
    const ImporteInput = () => {
      const [importe, setImporte] = useState("");
      const formatNumber = (number: { toLocaleString: (arg0: string, arg1: { minimumFractionDigits: number; maximumFractionDigits: number; }) => any; }) => {
        return number.toLocaleString('es-ES', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });}};
        const handleChange = (e: { target: { value: any; }; }) => {
          const value = e.target.value;
          const regex = /^\d*[,]?\d{0,2}$/; 
          if (regex.test(value) || value === "") {
            setImporte(value);
          }
        };
  
    const handleDateChange = (newDate: Date | null) => {
        setFechaValidacion(newDate);
      };
    async function FechasCreate(e: any) {
        setFechaValidacion(e);
        setPopoverOpen(false);
      }
      function setTipoAjuste(value: string): void {
        throw new Error("Function not implemented.");
      }

    return (
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
          placeholder="0,00"
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
    )
}

function setImporte(value: any) {
  throw new Error("Function not implemented.");
}
