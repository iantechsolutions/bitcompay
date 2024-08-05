"use client";
import { cn } from "~/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CalendarIcon } from "lucide-react";
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

  const { mutateAsync: createPricePerCondition } =
    api.pricePerCondition.create.useMutation();

  const { data, error, isLoading } =
    api.pricePerCondition.getByCreatedAt.useQuery({
      planId: props.plan?.id,
      createdAt: props.date,
    });
  console.log(data);

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editable, setEditable] = useState(false);
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
    const futurePrices = props.plan?.pricesPerCondition.filter(
      (price) => new Date(price.validy_date).getTime() > currentDate.getTime()
    );
    const pastPrices = props.plan?.pricesPerCondition.filter(
      (price) => new Date(price.validy_date).getTime() <= currentDate.getTime()
    );

    const mostRecentPastPrice = pastPrices?.reduce((latest, current) => {
      const latestDate = latest?.validy_date
        ? new Date(latest.validy_date).getTime()
        : 0;
      const currentDate = new Date(current.validy_date).getTime();
      return currentDate > latestDate ? current : latest;
    }, pastPrices[0]);

    const editablePrices = [...(futurePrices ?? [])];
    // if (mostRecentPastPrice) {
    //   editablePrices.push(mostRecentPastPrice);
    // }
    setEditable(
      editablePrices.filter(
        (x) => x.validy_date.getTime() == props.date.getTime()
      ).length > 0
    );
    // setEditablePrices(editablePrices);
  }, [props.plan?.pricesPerCondition]);

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

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <div className="flex-col">
            <Title>{props.plan!.description}</Title>
            <h2 className="mb-3 font-semibold text-xl">
              {formatter.format(props.date).charAt(0).toUpperCase() +
                formatter.format(props.date).slice(1)}
            </h2>
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
                          !validity_date && "text-muted-foreground"
                        )}
                      >
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
          {/* <div>
            <AddPlanDialog
              openExterior={openAdd}
              setOpenExterior={setOpenAdd}
              planId={props.plan?.id}
              initialPrices={groupByAge}
            ></AddPlanDialog>
          </div> */}
          {editable && (
            <div className="flex items-center">
              <Button onClick={() => handleUpdatePrice("edit")}>
                {" "}
                Editar precio
              </Button>
            </div>
          )}
        </div>
        {!isLoading && (
          <Tabs defaultValue="perAge">
            <TabsList>
              <TabsTrigger
                value="perAge"
                className="data-[state=active]:bg-[#71EBD4]"
              >
                Precios Por Edad
              </TabsTrigger>

              <TabsTrigger
                value="conditional"
                className="data-[state=active]:bg-[#71EBD4]"
              >
                Precios por relacion
              </TabsTrigger>
            </TabsList>
            <TabsContent value="conditional">
              <Table className="w-1/2 overflow-x-hidden">
                <TableHeader>
                  <TableRow className="bg-[#71EBD4] hover:bg-[#71EBD4] rounded-lg">
                    <TableHead className="h-7 text-left">Relacion</TableHead>
                    <TableHead className="h-7 text-left">Monto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data
                    ?.filter(
                      (precio) =>
                        precio.isAmountByAge === false &&
                        precio.validy_date.getTime() == props.date.getTime()
                    )
                    .map((price) => (
                      <TableRow key={price.id}>
                        <TableCell className="text-left pl-4 text-[#909090]">
                          {price.condition}
                        </TableCell>
                        <TableCell className="text-left pl-4 text-[#909090]">
                          {price.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="perAge">
              <Table className="w-1/2">
                <TableHeader>
                  <TableRow className="bg-[#71EBD4] hover:bg-[#71EBD4] rounded-lg">
                    <TableHead className="h-7 text-left">Desde edad</TableHead>
                    <TableHead className="h-7 text-left">Hasta edad</TableHead>
                    <TableHead className="h-7 text-left">Monto</TableHead>
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
                      <TableRow key={price.id} className="py-2">
                        <TableCell className="text-left pl-4 text-[#909090]">
                          {price.from_age}
                        </TableCell>
                        <TableCell className="text-left pl-4 text-[#909090]">
                          {price.to_age}
                        </TableCell>
                        <TableCell className="text-left pl-4 text-[#909090]">
                          ${price.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        )}
      </section>
    </LayoutContainer>
  );
}
