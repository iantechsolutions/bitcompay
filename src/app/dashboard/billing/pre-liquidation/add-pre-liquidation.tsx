"use client";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { Input } from "~/components/ui/input";
import utc from "dayjs/plugin/utc";
import { useState } from "react";
import { PlusCircleIcon, Loader2Icon } from "lucide-react";
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

export default function AddPreLiquidation(props: { companyId: string }) {
  const [open, setOpen] = useState(false);
  const [fechaVencimiento1, setFechaVencimiento1] = useState<Date>();
  const [fechaVencimiento2, setFechaVencimiento2] = useState<Date>();
  // const [fechaDesde, setFechaDesde] = useState<Date>();
  // const [fechaHasta, setFechaHasta] = useState<Date>();
  const [mes, setMes] = useState<number>(1);
  const [anio, setAnio] = useState<number>(2021);
  const [puntoVenta, setPuntoVenta] = useState("");
  const [logo_url, setLogo_url] = useState("");

  const [interest, setInterest] = useState<number | null>(null);
  const { data: marcas } = api.brands.getbyCurrentCompany.useQuery();
  const router = useRouter();

  const [popover1Open, setPopover1Open] = useState(false);
  const [popover2Open, setPopover2Open] = useState(false);

  const [brandId, setBrandId] = useState("");
  const { mutateAsync: createLiquidation, isLoading } =
    api.facturas.createPreLiquidation.useMutation();
  // const { mutateAsync: createFacturas } = api.family_groups.createPreLiquidation.useMutation();
  async function handleCreate() {
    // const { data:grupos } = api.family_groups.getByBrand.useQuery({brandId: brandId});
    const liquidation = await createLiquidation({
      pv: puntoVenta,
      brandId: brandId,
      dateDesde: new Date(anio, mes - 1, 1),
      dateHasta: new Date(anio, mes, 0),
      dateDue: fechaVencimiento2,
      companyId: props.companyId,
      interest: interest ?? undefined,
      logo_url: logo_url ?? undefined,
    });
    //TODO CORREGIR ESTO
    // await new Promise((resolve) => setTimeout(resolve, 500));

    if (liquidation) {
      toast.success("Pre-liquidacion creada correctamente");
      router.refresh();
      setOpen(false);
    } else {
      toast.error("Error al crear la pre-liquidacion");
    }
  }

  const handleBrandChange = (value: string) => {
    const selectedBrand = marcas?.find((marca) => marca.id === value);
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
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" /> Crear Pre liquidacion
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
                      key={marca!.id}
                      value={marca!.id}
                      className="rounded-none border-b border-gray-600">
                      {marca!.name}
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
                  )}>
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
                  )}>
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
                defaultValue={mes.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Enero</SelectItem>
                  <SelectItem value="2">Febrero</SelectItem>
                  <SelectItem value="3">Marzo</SelectItem>
                  <SelectItem value="4">Abril</SelectItem>
                  <SelectItem value="5">Mayo</SelectItem>
                  <SelectItem value="6">Junio</SelectItem>
                  <SelectItem value="7">Julio</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Septiembre</SelectItem>
                  <SelectItem value="10">Octubre</SelectItem>
                  <SelectItem value="11">Noviembre</SelectItem>
                  <SelectItem value="12">Diciembre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Año de Vigencia</Label>
              <Input
                className="border-green-300 focus-visible:ring-green-400 w-[100px]"
                type="number"
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
            onClick={handleCreate}>
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
