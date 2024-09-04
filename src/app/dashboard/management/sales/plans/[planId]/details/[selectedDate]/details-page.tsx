"use client";
import { cn } from "~/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CalendarIcon, Loader2Icon } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Calendar } from "~/components/ui/calendar";
import { useRouter } from "next/navigation";
import { LargeTable } from "~/components/table";
import type { TableHeaders } from "~/components/table";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { type RouterOutputs } from "~/trpc/shared";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Label } from "~/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { api } from "~/trpc/react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/tablePreliq";
import { GoBackButton } from "~/components/goback-button";
// import AddPlanDialogPerPrice from "./AddPlanDialog";

dayjs.extend(utc);
dayjs.locale("es");

const ageHeaders: TableHeaders = [
  { key: "from_age", label: "Desde edad", width: 150 },
  { key: "to_age", label: "Hasta edad", width: 150 },
  { key: "amount", label: "Monto", width: 150 },
];
const conditionHeaders: TableHeaders = [
  { key: "condition", label: "Relacion", width: 225 },
  { key: "amount", label: "Monto", width: 225 },
];

type GroupedPlans = {
  from_age: number;
  to_age: number;
  amount: number;
  condition: string | null;
  isConditional: boolean;
};

export default function DetailsPage(props: {
  plan: RouterOutputs["plans"]["get"];
  date: Date;
}) {
  const [groupByAge, setGroupByAge] = useState<GroupedPlans[]>([]);
  const formatter = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const { mutateAsync: deletePricePerCondition, isLoading: isDeleting } =
    api.pricePerCondition.delete.useMutation();

  const { data, error, isLoading } =
    api.pricePerCondition.getByCreatedAt.useQuery({
      planId: props.plan?.id,
      createdAt: props.date,
    });
  console.log(data);

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editable, setEditable] = useState(false);
  const [deleteable, setDeleteable] = useState(false);

  const [openAdd, setOpenAdd] = useState(false);
  const [percent, setPercent] = useState("");
  const [validity_date, setValidity_date] = useState<Date>();

  function handleUpdatePrice(value: string) {
    router.push(`./${props.date?.getTime()}/editDate`);
  }

  // const editable = props.plan?.pricesPerCondition?.sort((a, b) => b.validy_date.getTime() - a.validy_date.getTime()).
  // filter((x) => x.validy_date.getTime() <= new Date().getTime())[0].validy_date.getTime() == props.date.getTime();

  useEffect(() => {
    const currentDate = new Date();

    // Filtrar precios futuros y pasados
    const futurePrices = props.plan?.pricesPerCondition.filter(
      (price) => new Date(price.validy_date).getTime() > currentDate.getTime()
    );
    const pastPrices = (props.plan?.pricesPerCondition || [])
      .filter(
        (price) =>
          new Date(price.validy_date).getTime() <= currentDate.getTime()
      )
      .sort(
        (a, b) =>
          new Date(b.validy_date).getTime() - new Date(a.validy_date).getTime()
      );

    const mostRecentPastPrice = pastPrices[0];

    // Comparar usando getTime()
    const isEditable = mostRecentPastPrice
      ? new Date(mostRecentPastPrice.validy_date).getTime() ===
        new Date(props.date).getTime()
      : false;

    setEditable(isEditable);

    // Establecer el estado de deleteable si hay un precio futuro con la misma fecha
    setDeleteable(
      futurePrices!.some(
        (x) => new Date(x.validy_date).getTime() === props.date.getTime()
      )
    );
  }, [props.plan?.pricesPerCondition, props.date]);

  useEffect(() => {
    const groupByAge: GroupedPlans[] = [];
    let savedPrice = -1;
    props.plan?.pricesPerCondition
      //TODO: CAMBIAR ESTE SORT
      .sort((a, b) => (a.from_age ?? 1000) - (b.to_age ?? 1000))
      .forEach((price) => {
        if (price.isAmountByAge === true) {
          if (price.amount !== savedPrice) {
            groupByAge.push({
              from_age: price.from_age ?? 0,
              to_age: price.to_age ?? 0,
              amount: price.amount,
              condition: price.condition,
              isConditional: !price.isAmountByAge,
            });
            savedPrice = price.amount;
          } else if (groupByAge.length > 0) {
            const last = groupByAge[groupByAge.length - 1];
            last!.to_age = price.to_age ?? 0;
          }
        } else {
          groupByAge.push({
            from_age: price.from_age ?? 0,
            to_age: price.to_age ?? 0,
            amount: price.amount,
            condition: price.condition,
            isConditional: !price.isAmountByAge,
          });
        }
      });
    setGroupByAge(groupByAge);
  }, []);

  async function handleDelete() {
    try {
      // setIsLoading(true);
      await deletePricePerCondition({
        id: "",
      });

      // toast.success("Obra social eliminada correctamente");
      router.push("./");
    } catch (e) {
      // const error = asTRPCError(e)!;
      // toast.error(error.message);
    }
  }

  return (
    <LayoutContainer>
      <GoBackButton url={"../"} />
      <div>
        <section className="space-y-2">
          <div className="flex justify-between">
            <div className="flex-col">
                <Title>Planes
                  <span className="text-[#3e3e3e] font-medium text-xl">
                  {" "}
                  | {props.plan!.description}
                  </span>
                </Title>
              
              
              
            </div>
            <div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[600px] overflow-y-visible">
                  <DialogHeader>
                    <DialogTitle>
                      Actualizar porcentualmente precio de plan
                    </DialogTitle>
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
                            !validity_date && "opacity-50"
                          )}>
                          <p>
                            {validity_date ? (
                              dayjs(validity_date).format(
                                "D [de] MMMM [de] YYYY"
                              )
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
                          selected={validity_date ? validity_date : undefined}
                          onSelect={(e) => setValidity_date(e)}
                          disabled={(date: Date) => date < new Date()}
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
                    <Button onClick={() => handleUpdatePrice("percent")}>
                      Actualizar precio{" "}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {editable && (
              <Button
                onClick={() => handleUpdatePrice("edit")}
                className="ml-10">
                {" "}
                Editar precio
              </Button>
            )}

            {deleteable && (
              <div className="flex items-center">
                <Button
                  variant={"destructive"}
                  onClick={() => setOpenDelete(true)}>
                  Eliminar
                </Button>
                <Button
                  onClick={() => handleUpdatePrice("edit")}
                  className="ml-10">
                  {" "}
                  Editar precio
                </Button>
              </div>
            )}
          </div>
          <h2 className="flex flex-auto mb-3 justify-end">
                {formatter.format(props.date).charAt(0).toUpperCase() +
                  formatter.format(props.date).slice(1)}
          </h2>
          {!isLoading && (
            <Tabs defaultValue="perAge">
              <TabsList>
                <TabsTrigger
                  value="perAge"
                  className="">
                  Precios por edad
                </TabsTrigger>

                <TabsTrigger
                  value="conditional"
                  className="">
                  Precios por relacion
                </TabsTrigger>
              </TabsList>
              <TabsContent value="conditional">
              <Table className="w-5/6">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-3 pr-[7vw] font-medium text-center">Relacion</TableHead>
                      <TableHead className="px-[7vw] font-medium text-center">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody >
                    {data
                      ?.filter(
                        (precio) =>
                          precio.isAmountByAge === false &&
                          precio.validy_date.getTime() == props.date.getTime()
                      )
                      .map((price) => (
                        <TableRow key={price.id} className="border-b last:border-0">
                          <TableCell className="pl-3 whitespace-nowrap pr-[7vw] text-center font-medium opacity-60">
                            {price.condition}
                          </TableCell>
                          <TableCell className="text-center font-medium opacity-60">
                          ${price.amount}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="perAge">
                <Table className="w-5/6 ">
                  <TableHeader>
                    <TableRow className="place-content-start">
                      <TableHead className="pl-3 whitespace-nowrap pr-[7vw] font-medium text-center">
                        Desde edad
                      </TableHead>
                      <TableHead className=" px-[7vw] whitespace-nowrap font-medium text-center">
                        Hasta edad
                      </TableHead>
                      <TableHead className=" px-[7vw] font-medium text-center">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data
                      ?.filter(
                        (precio) =>
                          precio.isAmountByAge === true &&
                          precio.validy_date.getTime() == props.date.getTime()
                      )
                      .map((price) => (
                        <TableRow key={price.id} className=" items-start border-b last:border-0">
                          <TableCell className="pl-3 pr-[7vw] text-center font-medium opacity-60">
                            {price.from_age}  {(price.from_age==1)? ("año"):("años")}
                          </TableCell>
                          <TableCell className="px-[7vw] text-center font-medium opacity-60">
                            {price.to_age}  {(price.to_age==1)? ("año"):("años")}
                          </TableCell>
                          <TableCell className="px-[7vw] text-center font-medium opacity-60">
                            ${price.amount}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          )}
          <Dialog open={openDelete} onOpenChange={setOpenDelete}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Seguro que borrar esta vigencia?</DialogTitle>
              </DialogHeader>

              <DialogFooter>
                <Button onClick={() => setOpenDelete(false)}>Cancelar</Button>
                <Button disabled={isDeleting} onClick={handleDelete}>
                  {isDeleting && (
                    <Loader2Icon className="mr-2 animate-spin" size={20} />
                  )}
                  Eliminar vigencia
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>
      </div>
    </LayoutContainer>
  );
}
