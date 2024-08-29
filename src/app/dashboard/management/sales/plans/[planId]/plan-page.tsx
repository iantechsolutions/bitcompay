"use client";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, CirclePlus } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { List, ListTile } from "~/components/list";
import utc from "dayjs/plugin/utc";
import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { type RouterOutputs } from "~/trpc/shared";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import Link from "next/link";
import { CalendarIcon, Loader2Icon } from "lucide-react";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import AddPlanDialog from "../AddPlanDialog";
import { asTRPCError } from "~/lib/errors";
import { toast } from "sonner";

dayjs.extend(utc);
dayjs.locale("es");

export default function PlanPage(props: {
  plan: RouterOutputs["plans"]["get"];
}) {
  const plan = props.plan;
  const router = useRouter();
  const formatter = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const [arrayFechas, setArrayFechas] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const [anio, setAnio] = useState(2020);
  const [mes, setMes] = useState(0);
  const [vigente, setVigente] = useState<Date>();
  const [percent, setPercent] = useState("");

  const { mutateAsync: deletePlan, isLoading } = api.plans.delete.useMutation();

  const { mutateAsync: createPricePerAge } =
    api.pricePerCondition.create.useMutation();

  useEffect(() => {
    plan?.pricesPerCondition?.map((precio) => {
      const fecha = precio?.validy_date; // Convertir la fecha a cadena
      if (fecha) {
        if (!arrayFechas.find((x) => x.getTime() == fecha.getTime()!)) {
          arrayFechas.push(fecha);
        }

        const today = new Date();
        const fechasPasadas = arrayFechas.filter((fecha) => fecha < today);

        if (fechasPasadas.length > 0) {
          fechasPasadas.sort((a, b) => b.getTime() - a.getTime());
          setVigente(fechasPasadas[0]!);
        }
      }
    });
    const sortedArrayFechas = [...arrayFechas];
    sortedArrayFechas.sort((a, b) => b.getTime() - a.getTime());
    setArrayFechas(sortedArrayFechas);
  }, []);
  async function handleUpdatePrice() {
    setLoading(true);
    if (plan?.pricesPerCondition) {
      if (
        plan?.pricesPerCondition.filter(
          (x) => x.validy_date.getTime() === new Date(anio, mes, 1).getTime()
        ).length === 0
      ) {
        const validPrices = plan.pricesPerCondition.filter(
          (x) => x.validy_date.getTime() === vigente?.getTime()
        );
        for (const price of validPrices) {
          await createPricePerAge({
            plan_id: plan.id ?? "",
            amount: price.amount * (1 + parseFloat(percent) / 100),
            from_age: price.from_age ?? 0,
            to_age: price.to_age ?? 0,
            condition: price.condition ?? "",
            isAmountByAge: price.isAmountByAge,
            validy_date: new Date(anio, mes, 1),
          });
        }
        setOpen(false);
      } else {
        toast.error("Ya existe un listado de precios para el mes seleccionado");
        setLoading(false);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));

    router.refresh();
  }

  async function handleDelete() {
    try {
      await deletePlan({
        planId: plan!.id,
      });

      toast.success("El plan se eliminado correctamente");
      router.push("/dashboard/management/sales/plans");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex-col justify-between mb-5">
          <div className="flex justify-between">
            <Title>{plan!.description}</Title>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setOpenDelete(true)}
                className="bg-[#b12b2b] hover:bg-[#b12b2b] rounded-full text-white text-sm">
                <Trash2 className="mr-1 h-4" /> Eliminar plan
              </Button>

              <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      Seguro que desea eliminar el plan?
                    </DialogTitle>
                  </DialogHeader>

                  <DialogFooter>
                    <Button disabled={isLoading} onClick={handleDelete}>
                      {isLoading && (
                        <Loader2Icon className="mr-2 animate-spin" size={20} />
                      )}
                      Eliminar plan
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AddPlanDialog planId={plan?.id}></AddPlanDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    onClick={() => setOpen(true)}
                    className="bg-[#727272] hover:bg-[#727272] rounded-full text-white">
                    <Pencil className="mr-1 h-4" /> Actualizar precio{" "}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => setOpen(true)}
                    disabled={
                      plan?.pricesPerCondition.filter(
                        (x) => x.validy_date.getTime() <= new Date().getTime()
                      ).length === 0
                    }>
                    <div>Actualizar porcentualmente</div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href={`/dashboard/management/sales/plans/${plan?.id}/editPrice`}>
                      Actualizar manualmente
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <List>
            {arrayFechas.map((fecha) => {
              return (
                <ListTile
                  leading={
                    <Badge variant={fecha === vigente ? "default" : "outline"}>
                      {fecha === vigente ? "Vigente" : "No Vigente"}
                    </Badge>
                  }
                  key={fecha.toISOString().split("T")[0]}
                  href={`/dashboard/management/sales/plans/${
                    plan?.id
                  }/details/${fecha.getTime()}`}
                  title={`Vigente desde: ${
                    formatter.format(fecha).charAt(0).toUpperCase() +
                    formatter.format(fecha).slice(1)
                  }`}
                />
              );
            })}
          </List>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-visible">
          <DialogHeader>
            <DialogTitle>Actualizar porcentualmente precio de plan</DialogTitle>
          </DialogHeader>
          <Label htmlFor="validy_date">Mes de vigencia</Label>
          <Select
            onValueChange={(e) => setMes(Number(e))}
            defaultValue={mes.toString()}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="0"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 0, 1).getTime()
                  ).length !== 0
                }>
                Enero
              </SelectItem>
              <SelectItem
                value="1"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 1, 1).getTime()
                  ).length !== 0
                }>
                Febrero
              </SelectItem>
              <SelectItem
                value="2"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 2, 1).getTime()
                  ).length !== 0
                }>
                Marzo
              </SelectItem>
              <SelectItem
                value="3"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 3, 1).getTime()
                  ).length !== 0
                }>
                Abril
              </SelectItem>
              <SelectItem
                value="4"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 4, 1).getTime()
                  ).length !== 0
                }>
                Mayo
              </SelectItem>
              <SelectItem
                value="5"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 5, 1).getTime()
                  ).length !== 0
                }>
                Junio
              </SelectItem>
              <SelectItem
                value="6"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 6, 1).getTime()
                  ).length !== 0
                }>
                Julio
              </SelectItem>
              <SelectItem
                value="7"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 7, 1).getTime()
                  ).length !== 0
                }>
                Agosto
              </SelectItem>
              <SelectItem
                value="8"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 8, 1).getTime()
                  ).length !== 0
                }>
                Septiembre
              </SelectItem>
              <SelectItem
                value="9"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() === new Date(anio, 9, 1).getTime()
                  ).length !== 0
                }>
                Octubre
              </SelectItem>
              <SelectItem
                value="10"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() ===
                      new Date(anio, 10, 1).getTime()
                  ).length !== 0
                }>
                Noviembre
              </SelectItem>
              <SelectItem
                value="11"
                disabled={
                  plan?.pricesPerCondition?.filter(
                    (x) =>
                      x.validy_date.getTime() ===
                      new Date(anio, 11, 1).getTime()
                  ).length !== 0
                }>
                Diciembre
              </SelectItem>
            </SelectContent>
          </Select>
          <div>
            <Label>Año de Vigencia</Label>
            <Input
              className="border-green-300 focus-visible:ring-green-400 w-[100px]"
              type="number"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="number">Porcentaje de aumento</Label>
            <Input
              id="number"
              placeholder="Ej: 30%"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
            />
          </div>
          <div>
            <Button disabled={loading} onClick={handleUpdatePrice}>
              {loading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Actualizar precio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </LayoutContainer>
  );
}
