"use client";
import dayjs from "dayjs";
import "dayjs/locale/es";
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
  const [fechaDesde, setFechaDesde] = useState<Date>();
  const [fechaHasta, setFechaHasta] = useState<Date>();
  const [puntoVenta, setPuntoVenta] = useState("");
  console.log(props);
  const { data: marcas } = api.brands.getbyCompany.useQuery({
    companyId: props.companyId,
  });
  const router = useRouter();

  const [brandId, setBrandId] = useState("");
  const { mutateAsync: createLiquidation, isLoading } =
    api.facturas.createPreLiquidation.useMutation();
  // const { mutateAsync: createFacturas } = api.family_groups.createPreLiquidation.useMutation();
  async function handleCreate() {
    // const { data:grupos } = api.family_groups.getByBrand.useQuery({brandId: brandId});
    console.log("acaaaaaaaaaaa");
    const liquidation = await createLiquidation({
      pv: puntoVenta,
      brandId: brandId,
      dateDesde: fechaDesde,
      dateHasta: fechaHasta,
      dateDue: fechaVencimiento2,
      companyId: props.companyId,
    });
    console.log("liquidation", liquidation);
    if (liquidation) {
      toast.success("Pre-liquidacion creada correctamente");
      router.push("./pre-liquidation/" + liquidation?.id);
    } else {
      toast.error("Error al crear la pre-liquidacion");
    }
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
            <Select onValueChange={setBrandId}>
              <SelectTrigger className="w-[180px] font-bold">
                <SelectValue placeholder="Seleccione una marca" />
              </SelectTrigger>
              <SelectContent>
                {marcas &&
                  marcas.map((marca) => (
                    <SelectItem
                      key={marca!.id}
                      value={marca!.id}
                      className="rounded-none border-b border-gray-600"
                    >
                      {marca!.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>1er Fecha de vencimiento</Label>
            <br />
            <Popover>
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
                  onSelect={(e) => setFechaVencimiento1(e)}
                  disabled={(date: Date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>2da Fecha de vencimiento</Label>
            <br />
            <Popover>
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
                  selected={fechaVencimiento1 ? fechaVencimiento2 : undefined}
                  onSelect={(e) => setFechaVencimiento2(e)}
                  disabled={(date: Date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
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
