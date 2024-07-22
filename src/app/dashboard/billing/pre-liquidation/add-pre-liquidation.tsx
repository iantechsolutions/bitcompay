"use client";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { Input } from "~/components/ui/input";
import utc from "dayjs/plugin/utc";
import { useState } from "react";
import { PlusCircleIcon, Loader2Icon, Loader2 } from "lucide-react";
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
import { cn } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import { ComboboxDemo } from "~/components/ui/combobox";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

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

  const [interest, setInterest] = useState<number | null>(null);
  const { data: marcas } = api.brands.list.useQuery();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [popover1Open, setPopover1Open] = useState(false);
  const [popover2Open, setPopover2Open] = useState(false);

  const [brandId, setBrandId] = useState("");
  const { mutateAsync: createLiquidation, isLoading } =
    api.comprobantes.createPreLiquidation.useMutation();
  // const { mutateAsync: createFacturas } = api.family_groups.createPreLiquidation.useMutation();
  async function handleCreate() {
    // const { data:grupos } = api.family_groups.getByBrand.useQuery({brandId: brandId});
    // const date = new Date(anio, mes - 1, 1);
    if (mes && anio && anio >= new Date().getFullYear()) {
      const liquidation = await createLiquidation({
        pv: puntoVenta,
        brandId: brandId,
        dateDesde: new Date(anio, mes - 1, 1),
        dateHasta: new Date(anio, mes, 0),
        dateDue: fechaVencimiento2,
        interest: interest ?? undefined,
        logo_url: logo_url ?? undefined,
      });
      if ("error" in liquidation!) {
        toast.error("No se encuentran grupos familiares asociados a esa marca");
      } else if (liquidation) {
        queryClient.invalidateQueries();
        toast.success("Pre-liquidacion creada correctamente");
        setOpen(false);
      } else {
        toast.error("Error al crear la pre-liquidacion");
      }
    }
    if (!mes) {
      toast.error("Seleccione un mes");
    } else if (!anio || anio < new Date().getFullYear()) {
      toast.error("El año seleccionado no es valido");
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
      <Button disabled={isLoading} onClick={() => setOpen(true)}>
        {isLoading ? (
          <Loader2 className="mr-2 animate-spin" />
        ) : (
          <PlusCircleIcon className="mr-2" />
        )}
        Crear Pre liquidacion
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Pre liquidacion</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Marca</Label>
            <Select onValueChange={handleBrandChange}>
              <SelectTrigger className="w-[180px] font-bold">
                <SelectValue placeholder="Seleccione una marca" />
              </SelectTrigger>
              <SelectContent>
                {marcas &&
                  marcas.map((marca) => (
                    <SelectItem
                      key={marca?.id}
                      value={marca?.id}
                      className="rounded-none border-b border-gray-600"
                    >
                      {marca?.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>1er Fecha de vencimiento</Label>
            <br />
            <Popover open={popover1Open} onOpenChange={setPopover1Open}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] border-green-300 pl-3 text-left font-normal focus-visible:ring-green-400",
                    !fechaVencimiento1 && "text-muted-foreground"
                  )}
                >
                  <p>
                    {fechaVencimiento1 ? (
                      dayjs(fechaVencimiento1).format("D [de] MMMM [de] YYYY")
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
                  selected={
                    fechaVencimiento1 ? new Date(fechaVencimiento1) : undefined
                  }
                  onSelect={(e) => FechasCreate(e)}
                  disabled={(date: Date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>2da Fecha de vencimiento</Label>
            <br />
            <Popover open={popover2Open} onOpenChange={setPopover2Open}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] border-green-300 pl-3 text-left font-normal focus-visible:ring-green-400",
                    !fechaVencimiento2 && "text-muted-foreground"
                  )}
                >
                  <p>
                    {fechaVencimiento2 ? (
                      dayjs(fechaVencimiento2).format("D [de] MMMM [de] YYYY")
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
                  selected={fechaVencimiento2 ? fechaVencimiento2 : undefined}
                  onSelect={(e) => FechasCreate2(e)}
                  disabled={(date: Date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* <div>
            <Label>Fecha inicio de servicio</Label>
            <br />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] border-green-300 pl-3 text-left font-normal focus-visible:ring-green-400",
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
                  variant={"outline"}
                  className={cn(
                    "w-[240px] border-green-300 pl-3 text-left font-normal focus-visible:ring-green-400",
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
          <div className="flex flex-row space-x-24">
            <div>
              <Label htmlFor="validy_date">Mes de vigencia</Label>
              <Select
                onValueChange={(e) => setMes(Number(e))}
                defaultValue={mes?.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="1"
                    disabled={new Date(anio, 1, 1) < new Date()}
                  >
                    Enero
                  </SelectItem>
                  <SelectItem
                    value="2"
                    disabled={new Date(anio, 2, 1) < new Date()}
                  >
                    Febrero
                  </SelectItem>
                  <SelectItem
                    value="3"
                    disabled={new Date(anio, 3, 1) < new Date()}
                  >
                    Marzo
                  </SelectItem>
                  <SelectItem
                    value="4"
                    disabled={new Date(anio, 4, 1) < new Date()}
                  >
                    Abril
                  </SelectItem>
                  <SelectItem
                    value="5"
                    disabled={new Date(anio, 5, 1) < new Date()}
                  >
                    Mayo
                  </SelectItem>
                  <SelectItem
                    value="6"
                    disabled={new Date(anio, 6, 1) < new Date()}
                  >
                    Junio
                  </SelectItem>
                  <SelectItem
                    value="7"
                    disabled={new Date(anio, 7, 1) < new Date()}
                  >
                    Julio
                  </SelectItem>
                  <SelectItem
                    value="8"
                    disabled={new Date(anio, 8, 1) < new Date()}
                  >
                    Agosto
                  </SelectItem>
                  <SelectItem
                    value="9"
                    disabled={new Date(anio, 9, 1) < new Date()}
                  >
                    Septiembre
                  </SelectItem>
                  <SelectItem
                    value="10"
                    disabled={new Date(anio, 10, 1) < new Date()}
                  >
                    Octubre
                  </SelectItem>
                  <SelectItem
                    value="11"
                    disabled={new Date(anio, 11, 1) < new Date()}
                  >
                    Noviembre
                  </SelectItem>
                  <SelectItem
                    value="12"
                    disabled={new Date(anio, 12, 1) < new Date()}
                  >
                    Diciembre
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Año de Vigencia</Label>
              <Input
                className="border-green-300 focus-visible:ring-green-400 w-[100px]"
                type="number"
                min={new Date().getFullYear()}
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="name">Punto de venta a utilizar</Label>
            <br />
            <ComboboxDemo
              title="Seleccionar PV..."
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
          <div>
            <label htmlFor="interest"> Interes (%) </label>
            <Input
              className="border-green-300 focus-visible:ring-green-400 w-[100px]"
              type="number"
              value={interest ?? 0}
              onChange={(e) => {
                Number(e.target.value) === 0
                  ? setInterest(null)
                  : setInterest(Number(e.target.value));
              }}
            />
          </div>
          <Button
            className="mt-2"
            type="submit"
            disabled={isLoading}
            onClick={handleCreate}
          >
            {isLoading && (
              <Loader2Icon className="mr-2 animate-spin" size={20} />
            )}
            Crear Pre-liquidacion
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
