import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { FormControl, FormItem } from "~/components/ui/form";
import { date, datetime } from "drizzle-orm/mysql-core";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { Button } from "~/components/ui/button";
import Edit02Icon from "~/components/icons/edit-02-stroke-rounded";
import {
  ChevronDown,
  ViewIcon,
  Printer,
  CircleCheck,
  CircleX,
  CalendarIcon,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { RouterOutputs } from "~/trpc/shared";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { asTRPCError } from "~/lib/errors";
import { TableRecord } from "../columns";

type DialogCCProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  data?: TableRecord;
};

export default function DialogCC({ open, setOpen, data }: DialogCCProps) {
  const { mutateAsync: updateEvents } = api.events.update.useMutation();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [concept, setConcepto] = useState("");
  const [typeAd, setAdjustType] = useState("");
  const [user, setUser] = useState<string>("");
  const [fechaValidacion, setFechaValidacion] = useState<Date | null>(
    new Date()
  );
  dayjs.extend(utc);
  dayjs.locale("es");
  const [importe, setImporte] = useState(0);

  const handleDateChange = (newDate: Date | null) => {
    setFechaValidacion(newDate);
  };

  async function FechasCreate(e: any) {
    setFechaValidacion(e);
    setPopoverOpen(false);
  }

  const router = useRouter();
  const events = data?.events ?? [];

  function validateFields() {
    const errors: string[] = [];
    if (!concept) errors.push("concepto");
    if (!fechaValidacion) errors.push("Nombre del producto");
    if (!typeAd) errors.push("Tipo de ajuste");
    if (typeAd === "") errors.push("Tipo de ajuste");
    if (!importe) errors.push("Importe");
    return errors;
  }

  async function UpdateComprobante() {
    // console.log(events?.id);
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      return toast.error(
        `Los siguientes campos están vacíos: ${validationErrors.join(", ")}`
      );
    }

    try {
      if (events) {
        await updateEvents({
          id: events.id ?? "",
          current_amount: importe,
          description: concept,
          event_amount: importe,
        });

        toast.success("comprobante actualizado correctamente");
        router.refresh();
        setOpen(false);
      }
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
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
        <h1 className="text-xs block ml-2 pl-2">
          CUENTA CORRIENTE N° {events.currentAccount_id + "-" + events.id}
        </h1>

        <div className="flex justify-between p-2">
          <div className="w-1/2 mr-2 ml-2">
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
                        dayjs
                          .utc(fechaValidacion)
                          .format("D [de] MMMM [de] YYYY")
                      ) : (
                        <span>Elegir una fecha</span>
                      )}
                    </p>
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      fechaValidacion ? new Date(fechaValidacion) : undefined
                    }
                    onSelect={(e) => FechasCreate(e)}
                    disabled={(date: Date) => date < new Date("1900-01-01")}
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
            <Select onValueChange={(value) => setAdjustType(value)}>
              <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none">
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
            <Select onValueChange={(value) => setConcepto(value)}>
              <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none">
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
              value={importe}
              onChange={(e) => setImporte(parseInt(e.target.value))}
              className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
              placeholder="0,00"
            />
          </div>

          {/* <div className="w-1/3 mr-2 ml-1.5 p-1 pl-3">
            <Label htmlFor="usuario" className="text-xs mb-2 block">
              USUARIO
            </Label>
            <Input
              type="text"
              id="usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
              placeholder="Nombre del usuario"
            />
          </div> */}
        </div>

        <div className="flex gap-3 justify-end p-2">
          <Button
            onClick={UpdateComprobante}
            className="h-7 bg-[#BEF0BB] hover:bg-[#DEF5DD] text-[#3e3e3e] font-medium text-base rounded-full py-5 px-6">
            Actualizar
          </Button>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="h-7 bg-[#D9D7D8] hover:bg-[#d9d7d8dc] border-0 text-[#3e3e3e] font-medium text-base rounded-full py-5 px-6">
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
