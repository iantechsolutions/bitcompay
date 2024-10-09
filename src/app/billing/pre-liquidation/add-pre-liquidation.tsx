"use client";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { Input } from "~/components/ui/input";
import utc from "dayjs/plugin/utc";
import {
  // JSXElementConstructor,
  // Key,
  // ReactElement,
  // ReactNode,
  // ReactPortal,
  useState,
} from "react";
import {
  PlusCircleIcon,
  Loader2Icon,
  Loader2,
  Plus,
  CirclePlus,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import AddElementButton from "~/components/add-element";
import { cn } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import { ComboboxDemo } from "~/components/ui/combobox";
import { useQueryClient } from "@tanstack/react-query";
import { asTRPCError } from "~/lib/errors";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
export default function AddPreLiquidation() {
  const [open, setOpen] = useState(false);
  const [fechaVencimiento1, setFechaVencimiento1] = useState<Date>();
  const [fechaVencimiento2, setFechaVencimiento2] = useState<Date>();
  // const [fechaDesde, setFechaDesde] = useState<Date>();
  // const [fechaHasta, setFechaHasta] = useState<Date>();
  const [mes, setMes] = useState<number | null>(null);
  const [anio, setAnio] = useState<number>(new Date().getFullYear());
  const [puntoVenta, setPuntoVenta] = useState("");
  const [logo_url, setLogo_url] = useState("");

  const [interest, setInterest] = useState<number | null>(0);
  const { data: marcas } = api.brands.list.useQuery();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [popover1Open, setPopover1Open] = useState(false);
  const [popover2Open, setPopover2Open] = useState(false);

  const [brandId, setBrandId] = useState("");
  const { mutateAsync: createLiquidation, isLoading } =
    api.comprobantes.createPreLiquidation.useMutation();

  function validateFields() {
    const errors: string[] = [];
    if (!puntoVenta) errors.push("Punto de venta");
    if (!brandId) errors.push("Marca");
    if (!fechaVencimiento2 || !fechaVencimiento1) errors.push("Vencimientos");
    if (!mes) errors.push("Mes de vigencia");

    return errors;
  }

  async function handleCreate() {
    const validationErrors = validateFields();
    if (validationErrors.length > 0) {
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors.length
          ? validationErrors.join(", ")
          : "No se encontraron errores específicos.";

        return toast.error(
          `Los siguientes campos están vacíos y son obligatorios: ${errorMessages}`
        );
      }
    }

    try {
      if (mes && anio && anio >= new Date().getFullYear()) {
        const liquidation = await createLiquidation({
          pv: puntoVenta,
          brandId: brandId,
          dateDesde: new Date(anio, mes - 1, 1),
          dateHasta: new Date(anio, mes, 0),
          dateDue: fechaVencimiento1,
          interest: interest ?? 0,
          logo_url: logo_url ?? undefined,
        });

        if ("error" in liquidation!) {
          toast.error(liquidation.error);
        } else if (liquidation) {
          toast.success("Preliquidación creada correctamente");
          queryClient.invalidateQueries();
          setOpen(false);
        } else {
          toast.error("Error al crear la Preliquidación");
        }
      }
    } catch (e) {
      console.log("error", e);
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }

    //TODO CORREGIR ESTO
    // await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const handleBrandChange = (value: string) => {
    setBrandId(value);
  };

  async function FechasCreate(e: any) {
    setFechaVencimiento1(e);
    setPopover1Open(false);
  }
  async function FechasCreate2(e: any) {
    setFechaVencimiento2(e);
    setPopover2Open(false);
  }
  return (
    <>
      {/* <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" /> Crear Pre liquidacion
      </Button> */}
      <AddElementButton
        onClick={() => setOpen(true)}
        className="rounded-full gap-1 p-4 text-base text-[#3E3E3E] bg-[#BEF0BB] ">
        <PlusCircleIcon className="h-4" />
        Agregar preliquidación
      </AddElementButton>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader className="flex mx-5 ">
            <DialogTitle className="flex text-2xl">Crear preliquidación</DialogTitle>
          
          <div className="w-full text-gray-500 py-4 ">
            <Label className="text-xs">MARCA</Label>
            <Select onValueChange={handleBrandChange}>
              <SelectTrigger
                className="w-full  border-[#BEF0BB] border-0 border-b text-[#3E3E3E] bg-background rounded-none shadow-none
              hover:none justify-self-right">
                <SelectValue placeholder="Seleccione una marca" />
              </SelectTrigger>
              <SelectContent>
                {marcas &&
                  marcas.map((marca: any) => (
                    <SelectItem
                      key={marca?.id}
                      value={marca?.id}
                      className="rounded-none hover:focus:bg-green-300">
                      {marca?.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full flex flex-row gap-2 py-4 text-gray-500 justify-start">
            <div className="w-1/2 pr-2">
              <Label className="text-xs">1° FECHA DE VENCIMIENTO</Label>
              <br />
              <Popover open={popover1Open} onOpenChange={setPopover1Open}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"form"}
                    className={cn(
                      "w-full border-b border-[#BEF0BB] pl-3 text-left font-normal hover:bg-none hover:bg-transparent shadow-none overflow-hidden text-ellipsis whitespace-nowrap",
                      !fechaVencimiento1 && "text-muted-foreground"
                    )}>
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[#3E3E3E]">
                      {fechaVencimiento1 ? (
                        dayjs(fechaVencimiento1).format("D [de] MMMM [de] YYYY")
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                    </p>
                    <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      fechaVencimiento1
                        ? new Date(fechaVencimiento1)
                        : undefined
                    }
                    onSelect={(e) => FechasCreate(e)}
                    disabled={(date: Date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-1/2 pl-2">
              <Label className="text-xs">2° FECHA DE VENCIMIENTO</Label>
              <br />
              <Popover open={popover2Open} onOpenChange={setPopover2Open}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"form"}
                    className={cn(
                      "w-full border-b border-[#BEF0BB] pl-3 text-left font-normal hover:bg-none hover:bg-transparent",
                      !fechaVencimiento2 && "text-muted-foreground"
                    )}>
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[#3E3E3E]">
                      {fechaVencimiento2 ? (
                        dayjs(fechaVencimiento2).format("D [de] MMMM [de] YYYY")
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                    </p>
                    <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fechaVencimiento2 ? fechaVencimiento2 : undefined}
                    onSelect={(e) => FechasCreate2(e)}
                    disabled={(date: Date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {/* <div>
            <Label>Fecha inicio de servicio</Label>
            <br />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"form"}
                  className={cn(
                    "w-[240px]  border-[#BEF0BB] pl-3 text-left font-normal focus-visible:ring-green-400",
                    !fechaDesde && "text-muted-foreground"
                  )}
                >
                  <p>
                    {fechaDesde ? (
                      dayjs(fechaDesde).format("D [de] MMMM [de] YYYY")
                    ) : (
                      <span>Seleccione una fecha</span>
                    )}
                  </p>
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaDesde ? fechaDesde : undefined}
                  onSelect={(e) => setFechaDesde(e)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Fecha fin de servicio</Label>
            <br />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"form"}
                  className={cn(
                    "w-[240px]  border-[#BEF0BB] pl-3 text-left font-normal focus-visible:ring-green-400",
                    !fechaHasta && "text-muted-foreground"
                  )}
                >
                  <p>
                    {fechaHasta ? (
                      dayjs(fechaHasta).format("D [de] MMMM [de] YYYY")
                    ) : (
                      <span>Seleccione una fecha</span>
                    )}
                  </p>
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaHasta ? fechaHasta : undefined}
                  onSelect={(e) => setFechaHasta(e)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div> */}
          <div className="w-full flex flex-row gap-2 py-4 text-gray-500">
            <div className="w-1/2 pr-2">
              <Label htmlFor="validy_date" className="text-xs">
                MES DE VIGENCIA
              </Label>
              <Select
                onValueChange={(e) => setMes(Number(e))}
                defaultValue={mes?.toString()}>
                <SelectTrigger className="w-full  border-[#BEF0BB] border-0 border-b text-[#3E3E3E] bg-background rounded-none">
                  <SelectValue placeholder="Seleccione un mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="1"
                    disabled={new Date(anio, 1, 1) < new Date()}>
                    Enero
                  </SelectItem>
                  <SelectItem
                    value="2"
                    disabled={new Date(anio, 2, 1) < new Date()}>
                    Febrero
                  </SelectItem>
                  <SelectItem
                    value="3"
                    disabled={new Date(anio, 3, 1) < new Date()}>
                    Marzo
                  </SelectItem>
                  <SelectItem
                    value="4"
                    disabled={new Date(anio, 4, 1) < new Date()}>
                    Abril
                  </SelectItem>
                  <SelectItem
                    value="5"
                    disabled={new Date(anio, 5, 1) < new Date()}>
                    Mayo
                  </SelectItem>
                  <SelectItem
                    value="6"
                    disabled={new Date(anio, 6, 1) < new Date()}>
                    Junio
                  </SelectItem>
                  <SelectItem
                    value="7"
                    disabled={new Date(anio, 7, 1) < new Date()}>
                    Julio
                  </SelectItem>
                  <SelectItem
                    value="8"
                    disabled={new Date(anio, 8, 1) < new Date()}>
                    Agosto
                  </SelectItem>
                  <SelectItem
                    value="9"
                    disabled={new Date(anio, 9, 1) < new Date()}>
                    Septiembre
                  </SelectItem>
                  <SelectItem
                    value="10"
                    disabled={new Date(anio, 10, 1) < new Date()}>
                    Octubre
                  </SelectItem>
                  <SelectItem
                    value="11"
                    disabled={new Date(anio, 11, 1) < new Date()}>
                    Noviembre
                  </SelectItem>
                  <SelectItem
                    value="12"
                    disabled={new Date(anio, 12, 1) < new Date()}>
                    Diciembre
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/2 pl-2">
              <Label className="text-xs">AÑO DE VIGENCIA</Label>
              <Input
                className="w-full  border-[#BEF0BB] border-0 border-b text-[#3E3E3E] bg-background rounded-none"
                type="number"
                min={new Date().getFullYear()}
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
              />
            </div>
          </div>
          <div className="flex flex-row py-4 gap-2  text-gray-500">
            <div className="w-1/2 text-nowrap pr-2">
              <Label htmlFor="name" className="text-xs">
                PUNTO DE VENTA A UTILIZAR
              </Label>
              <br />
              <ComboboxDemo
                title="Seleccionar PV..."
                classNameButton="w-full flex justify-between items-center p-4  border-[#BEF0BB] border-0 border-b text-[#3E3E3E]"
                placeholder="_"
                options={[
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                ]}
                onSelectionChange={(e) => {
                  setPuntoVenta(e);
                }}
              />
            </div>
            <div className="w-1/2 pl-2">
              <Label htmlFor="interest" className="text-xs">
                {" "}
                INTERÉS (%)*{" "}
              </Label>
              <Input
                className="w-full  border-[#BEF0BB] border-0 border-b text-[#3E3E3E] bg-background rounded-none "
                type="number"
                placeholder="0,00"
                value={interest ?? 0}
                onChange={(e) => {
                  Number(e.target.value) >= 0 || e.target.value === ""
                    ? setInterest(Number(e.target.value))
                    : null;
                }}
              />
            </div>
          </div>
          <div className="py-4">
            <h3 className="text-[#3E3E3E] font-thin text-opacity-80 text-[10px] italic justify-center">
              *Aplica sobre saldos adeudados de períodos anteriores. Completar
              con alícuota como porcentaje directo sobre la base del cálculo.
            </h3>
          </div>
          <div className="flex pt-4 pb-2 justify-center">
            <Button
              type="submit"
              className="flex rounded-full w-fit justify-self-center bg-[#BEF0BB] text-[#3E3E3E] hover:bg-[#DEF5DD]"
              disabled={isLoading}
              onClick={handleCreate}>
              {isLoading ? (
                <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
              ) : (
                <CirclePlus className="h-4 mr-1 stroke-1" />
              )}
              Crear Preliquidación
            </Button>
          </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
