"use client";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";
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
import { useCompanyData } from "~/app/dashboard/company-provider";
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
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import Link from "next/link";
import { CalendarIcon } from "lucide-react";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import AddPlanDialog from "../AddPlanDialog";
dayjs.extend(utc);
dayjs.locale("es");

export default function PlanPage(props: {
  plan: RouterOutputs["plans"]["get"];
}) {
  const router = useRouter();
  const formatter = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const [arrayFechas, setArrayFechas] = useState<Date[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const [anio, setAnio] = useState(2020);
  const [mes, setMes] = useState(0);
  const [vigente, setVigente] = useState<Date>();
  const [percent, setPercent] = useState("");
  const { mutateAsync: createPricePerAge } =
    api.pricePerCondition.create.useMutation();

  useEffect(() => {
    props.plan?.pricesPerCondition?.map((precio) => {
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
  const company = useCompanyData();
  function handleUpdatePrice() {
    props.plan?.pricesPerCondition.forEach((price) => {
      createPricePerAge({
        plan_id: props.plan?.id ?? "",
        amount: price.amount * (1 + parseFloat(percent) / 100),
        from_age: price.from_age ?? 0,
        to_age: price.to_age ?? 0,
        condition: price.condition ?? "",
        isAmountByAge: price.isAmountByAge,
        validy_date: new Date(anio, mes, 1),
      });
    });
  }
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex-col justify-between mb-5">
          <div className="flex justify-between">
            <Title>{props.plan!.description}</Title>
            <div className="flex items-center">
              <AddPlanDialog planId={props.plan?.id}></AddPlanDialog>
              {/* <Button
                className="mr-2"
                onClick={() => router.push(`./${props.plan?.id}/editInfo`)}
              >
                Actualizar info{" "}
              </Button> */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button onClick={() => setOpen(true)}>
                    Actualizar precio{" "}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <div onClick={() => setOpen(true)}>
                      Actualizar porcentualmente
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link
                      href={`/dashboard/management/sales/plans/${props.plan?.id}/editPrice`}
                    >
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
                    props.plan?.id
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
            defaultValue={mes.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Enero</SelectItem>
              <SelectItem value="1">Febrero</SelectItem>
              <SelectItem value="2">Marzo</SelectItem>
              <SelectItem value="3">Abril</SelectItem>
              <SelectItem value="4">Mayo</SelectItem>
              <SelectItem value="5">Junio</SelectItem>
              <SelectItem value="6">Julio</SelectItem>
              <SelectItem value="7">Agosto</SelectItem>
              <SelectItem value="8">Septiembre</SelectItem>
              <SelectItem value="9">Octubre</SelectItem>
              <SelectItem value="10">Noviembre</SelectItem>
              <SelectItem value="11">Diciembre</SelectItem>
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
            <Button onClick={handleUpdatePrice}>Actualizar precio</Button>
          </div>
        </DialogContent>
      </Dialog>
    </LayoutContainer>
  );
}
