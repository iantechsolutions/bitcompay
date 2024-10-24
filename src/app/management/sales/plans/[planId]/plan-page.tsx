"use client";
import { useRouter } from "next/navigation";
import { Trash2, ChevronDown, PlusCircleIcon } from "lucide-react";
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
import Settings02Icon from "~/components/icons/settings-02-stroke-rounded";

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
  // const [open, setOpen] = useState<boolean>(false);

  const [vigente, setVigente] = useState<Date>();

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

  const { mutateAsync: deletePricePerCondition, isLoading: isDeleting } =
    api.pricePerCondition.deleteByPlanAndDate.useMutation();
  const handleDelete = async (planId: string, currentVigency: Date) => {
    try {
      await deletePricePerCondition({
        id: planId,
        currentVigency: currentVigency,
      });
      toast.success("Precios eliminados correctamente");

      window.location.reload();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  };

  // async function handleUpdatePrice() {
  //   console.log("llego");
  //   setLoading(true);
  //   if (plan?.pricesPerCondition) {
  //     if (
  //       plan?.pricesPerCondition.filter(
  //         (x) => x.validy_date.getTime() === new Date(anio, mes, 1).getTime()
  //       ).length === 0
  //     ) {
  //       const validPrices = plan.pricesPerCondition.filter(
  //         (x) => x.validy_date.getTime() === vigente?.getTime()
  //       );
  //       for (const price of validPrices) {
  //         await createPricePerAge({
  //           plan_id: plan.id ?? "",
  //           amount: price.amount * (price.amount + percent / 100),
  //           from_age: price.from_age ?? 0,
  //           to_age: price.to_age ?? 0,
  //           condition: price.condition ?? "",
  //           isAmountByAge: price.isAmountByAge,
  //           validy_date: new Date(anio, mes, 1),
  //         });
  //       }
  //       toast.success("Se actualizo el listado de precios");
  //       router.refresh();
  //       setOpen(false);
  //     } else {
  //       toast.error("Ya existe un listado de precios para el mes seleccionado");
  //       setLoading(false);
  //     }
  //   }
  //   await new Promise((resolve) => setTimeout(resolve, 3000));

  //   router.refresh();
  // }

  const planName = plan?.description;
  return (
    <LayoutContainer pageName={planName}>
      <section className="space-y-2">
        <div className="flex-col justify-between mb-5">
          <div className="flex justify-between">
            <Title>
              Planes
              <span className="text-[#3e3e3e] font-medium text-lg">
                {" "}
                {plan?.description}
              </span>
            </Title>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className=" bg-[#BEF0BB] hover:bg-[#DEF5DD]  rounded-full text-[#3E3E3E] hover:text-[#3E3E3E]">
                  <Settings02Icon className="mr-2 h-5" strokeWidth={1} />
                  Opciones
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
                      href={`/management/sales/plans/${
                        plan?.id ?? ""
                      }/editPrice`}
                      className="p-0 text-[#3e3e3e] w-full font-medium shadow-none h-5 flex">
                      <PlusCircleIcon
                        className="mr-2"
                        size={20}
                        strokeWidth={1}
                      />
                      Agregar precio
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
                      className={`w-24 rounded-2xl ${
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
                      <DropdownMenuContent className="bg-[#f7f7f7] w-full">
                        <DropdownMenuItem className="w-full p-0 flex">
                          <button
                            onClick={() =>
                              router.push(
                                `/management/sales/plans/${
                                  plan?.id
                                }/details/${fecha.getTime()}`
                              )
                            }
                            className="bg-transparent hover:bg-[#f0f0f0] p-2 text-[#3e3e3e] shadow-none w-full flex items-center justify-start">
                            <ViewIcon className="mr-1 h-4" /> Ver
                          </button>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {vigente ? (
                          <div>
                            <DropdownMenuItem
                              disabled={vigente > fecha}
                              className="w-full p-0 flex"
                              onSelect={(e) => e.preventDefault()}>
                              <div className="w-full">
                                <EditPrice
                                  plan={plan}
                                  fecha={fecha.getTime()}
                                />
                              </div>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="w-full p-0 flex"
                              onSelect={(e) => e.preventDefault()}
                              disabled={vigente === fecha || vigente > fecha}>
                              <div className="w-full">
                                <DeletePrice
                                  planId={plan?.id ?? ""}
                                  currentVigency={fecha}
                                  onDelete={() =>
                                    handleDelete(plan?.id ?? "", fecha)
                                  }
                                />
                              </div>
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
    </LayoutContainer>
  );
}

{
  /* <Dialog open={open} onOpenChange={setOpen}>
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
        type="number"
        value={percent}
        onChange={(e) => setPercent(parseInt(e.target.value))}
      />
    </div>

    <div>
      <Button
        disabled={loading}
        onClick={handleUpdatePrice}
        className="bg-[#BEF0BB] hover:bg-[#BEF0BB] ml-3 rounded-full mr-4 px-6 text-black font-normal hover:text-[#3E3E3E] w-full">
        {loading && (
          <Loader2Icon className="mr-2 animate-spin" size={20} />
        )}
        <CreditCardPosIcon className="mr-2 font-medium" />
        Actualizar precio
      </Button>
    </div>
  </DialogContent>
</Dialog> */
}
