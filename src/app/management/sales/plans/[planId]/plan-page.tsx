"use client";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Trash2,
  CirclePlus,
  ChevronDown,
  PlusCircleIcon,
  PlusCircle,
} from "lucide-react";
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
  DropdownMenuSeparator,
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
import CreditCardPosIcon from "~/components/icons/credit-card-pos-stroke-rounded";
import ViewIcon from "~/components/icons/view-stroke-rounded";
import Delete02Icon from "~/components/icons/delete-02-stroke-rounded";
import Edit02Icon from "~/components/icons/edit-02-stroke-rounded";
import DeletePrice from "~/components/plan/delete-price";
import EditPrice from "~/components/plan/edit-price";

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
      router.push("/management/sales/plans");
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
            <Title>
              Planes
              <span className="text-[#3e3e3e] font-medium text-xl">
                {" "}
                {plan?.description}
              </span>
            </Title>

            <div className="flex items-center space-x-2">
              <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <DialogContent className="p-4 rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="m-2 font-medium text-center pr-6">
                      ¿Seguro que desea eliminar el plan?
                    </DialogTitle>
                  </DialogHeader>

                  <DialogFooter>
                    <Button
                      type="submit"
                      className="m-2 mb-2 pl-4 pr-6 rounded-full w-fit mr-36 ml-32 justify-normal bg-[#BEF0BB] text-[#3E3E3E] hover:bg-[#DEF5DD]"
                      disabled={isLoading}
                      onClick={handleDelete}>
                      {isLoading && (
                        <Loader2Icon className="mr-2 animate-spin" size={20} />
                      )}
                      <Trash2 className="m-3 font-medium place-content-center" />
                      <h1 className="font-medium-medium p-1">Eliminar</h1>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className=" bg-[#BEF0BB] hover:bg-[#BEF0BB]  rounded-full text-[#3E3E3E] hover:text-[#3E3E3E]">
                  <PlusCircleIcon className="mr-2" size={20} strokeWidth={1} />
                  Agregar precio
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <AddPlanDialog planId={plan?.id} />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <DropdownMenuItem>
                    <Link
                      href={`/management/sales/plans/${plan?.id}/editPrice`}
                      className="p-0 text-[#3e3e3e] font-medium shadow-none h-5 flex">
                      Agregar manualmente
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <List>
            {arrayFechas.map((fecha) => {
              return (
                <ListTile
                  className="pl-7 hover:cursor-default"
                  leading={
                    <Badge
                      className={`w-24 ${
                        fecha === vigente
                          ? "bg-[#DDF9CC] text-[#4E9F1D]"
                          : "bg-[#f9bcbc] text-[#ec3c3c]"
                      }`}>
                      {fecha === vigente ? "Vigente" : "No Vigente"}
                    </Badge>
                  }
                  key={fecha.toISOString().split("T")[0]}
                  title={`Vigente desde: ${
                    formatter.format(fecha).charAt(0).toUpperCase() +
                    formatter.format(fecha).slice(1)
                  }`}
                  trailing={
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size={"icon"}
                          className="bg-transparent hover:bg-transparent p-0 text-[#3e3e3e] shadow-none mr-4">
                          <ChevronDown className="h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Button
                            onClick={() =>
                              router.push(
                                `/management/sales/plans/${
                                  plan?.id
                                }/details/${fecha.getTime()}`
                              )
                            }
                            className="bg-transparent hover:bg-transparent p-0 text-[#3e3e3e] shadow-none h-5">
                            <ViewIcon className="mr-1 h-4" /> Ver
                          </Button>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {vigente ? (
                          <div>
                            <DropdownMenuItem
                              disabled={vigente > fecha}
                              onSelect={(e) => e.preventDefault()}>
                              <EditPrice plan={plan} fecha={fecha.getTime()} />
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              disabled={vigente === fecha || vigente > fecha}>
                              <DeletePrice
                                planId={plan?.id ?? ""}
                                currentVigency={fecha}
                              />
                            </DropdownMenuItem>
                          </div>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                />
              );
            })}
          </List>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-visible m-3 rounded-2xl">
          <DialogHeader className="p-2 ml-2">
            <DialogTitle>Actualizar porcentualmente precio de plan</DialogTitle>
          </DialogHeader>
          <div className="w-1/4 text-gray-500 mb-2 ml-3">
            <Label htmlFor="validy_date" className="text-xs">
              MES DE VIGENCIA
            </Label>
            <Select
              onValueChange={(e) => setMes(Number(e))}
              defaultValue={mes?.toString()}>
              <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none focus-visible:ring-green-400">
                <SelectValue placeholder="Seleccione un mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="0"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 0, 1).getTime()
                    ).length !== 0
                  }>
                  Enero
                </SelectItem>
                <SelectItem
                  value="1"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 1, 1).getTime()
                    ).length !== 0
                  }>
                  Febrero
                </SelectItem>
                <SelectItem
                  value="2"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 2, 1).getTime()
                    ).length !== 0
                  }>
                  Marzo
                </SelectItem>
                <SelectItem
                  value="3"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 3, 1).getTime()
                    ).length !== 0
                  }>
                  Abril
                </SelectItem>
                <SelectItem
                  value="4"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 4, 1).getTime()
                    ).length !== 0
                  }>
                  Mayo
                </SelectItem>
                <SelectItem
                  value="5"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 5, 1).getTime()
                    ).length !== 0
                  }>
                  Junio
                </SelectItem>
                <SelectItem
                  value="6"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 6, 1).getTime()
                    ).length !== 0
                  }>
                  Julio
                </SelectItem>
                <SelectItem
                  value="7"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 7, 1).getTime()
                    ).length !== 0
                  }>
                  Agosto
                </SelectItem>
                <SelectItem
                  value="8"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 8, 1).getTime()
                    ).length !== 0
                  }>
                  Septiembre
                </SelectItem>
                <SelectItem
                  value="9"
                  disabled={
                    plan?.pricesPerCondition?.filter(
                      (x) =>
                        x.validy_date.getTime() ===
                        new Date(anio, 9, 1).getTime()
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
          </div>
          <div className="w-1/4 text-gray-500 mb-2 ml-3">
            <Label className="text-xs">AÑO DE VIGENCIA</Label>
            <Input
              className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none "
              type="number"
              min={new Date().getFullYear()}
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
            />
          </div>

          <div className="w-1/4 text-gray-500 mb-2 ml-3">
            <Label className="text-xs text-nowrap" htmlFor="number">
              PORCENTAJE DE AUMENTO (EJ: 30%){" "}
            </Label>
            <Input
              className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none"
              id="number"
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
            />
          </div>

          <div>
            <Button
              disabled={loading}
              onClick={handleUpdatePrice}
              className="bg-[#BEF0BB] hover:bg-[#BEF0BB] ml-3 rounded-full mr-4 px-6 text-black font-normal hover:text-[#3E3E3E]">
              {loading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              <CreditCardPosIcon className="mr-2 font-medium" />
              Actualizar precio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </LayoutContainer>
  );
}
