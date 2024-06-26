"use client";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";
import dayjs from "dayjs";
import "dayjs/locale/es";
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
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import Link from "next/link";
import { CalendarIcon } from "lucide-react";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
dayjs.extend(utc);
dayjs.locale("es");

export default function PlanPage(props: {
  plan: RouterOutputs["plans"]["get"];
}) {
  const formatter = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const [arrayFechas, setArrayFechas] = useState<Date[]>([]);
  const [vigente, setVigente] = useState<Date | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  // const [validity_date, setValidity_date] = useState<Date | null>(null);
  // const [percent, setPercent] = useState("");
  // const { mutateAsync: createPricePerAge } =
  //   api.pricePerAge.create.useMutation();

  // function handleUpdatePrice() {
  //   props.plan?.pricesPerAge.forEach((price) => {
  //     createPricePerAge({
  //       plan_id: props.plan?.id ?? "",
  //       amount: price.amount * (1 + parseFloat(percent) / 100),
  //       age: price.age ?? 0,
  //       condition: price.condition ?? "",
  //       isAmountByAge: price.isAmountByAge,
  //       validy_date: validity_date ?? new Date(),
  //     });
  //   });
  // }

  useEffect(() => {
    props.plan?.pricesPerCondition?.map((precio) => {
      const fecha = precio?.validy_date; // Convertir la fecha a cadena
      if (fecha) {
        if (!arrayFechas.find((x) => x.getTime() == fecha.getTime()!)) {
          arrayFechas.push(fecha);
        }
      }

      const uniqueFechas = [...arrayFechas];
      uniqueFechas.sort((a, b) => b.getTime() - a.getTime());
      setArrayFechas(uniqueFechas);

      const today = new Date();
      const fechasPasadas = uniqueFechas.filter((fecha) => fecha < today);

      if (fechasPasadas.length > 0) {
        fechasPasadas.sort((a, b) => b.getTime() - a.getTime());
        setVigente(fechasPasadas[0]!);
      }
    });
  }, []);

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex-col justify-between mb-5">
          <div className="flex justify-between">
            <Title>{props.plan!.description}</Title>
            <div className="flex items-center">
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
                      href={`/dashboard/management/sales/plans/${props.plan?.id}/edit`}
                    >
                      Ir a editar precio
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <List>
            {arrayFechas.map((fecha) => {
              const esVigente = fecha.getTime() === vigente!.getTime();
              return (
                <ListTile
                  leading={
                    <Badge variant={esVigente ? "default" : "outline"}>
                      {esVigente ? "Vigente" : "No Vigente"}
                    </Badge>
                  }
                  key={fecha.toISOString().split("T")[0]}
                  href={`/dashboard/management/sales/plans/${
                    props.plan?.id
                  }/${fecha.getTime()}`}
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
      {/* 
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-visible">
          <DialogHeader>
            <DialogTitle>Actualizar porcentualmente precio de plan</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Fecha de vigencia</Label>
            <br />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] border-green-300 pl-3 text-left font-normal focus-visible:ring-green-400",
                    !validity_date && "text-muted-foreground"
                  )}>
                  <p>
                    {validity_date ? (
                      dayjs(validity_date).format("D [de] MMMM [de] YYYY")
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
                  selected={validity_date ?? undefined}
                  onSelect={(e) => setValidity_date(e)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
      </Dialog> */}
    </LayoutContainer>
  );
}
