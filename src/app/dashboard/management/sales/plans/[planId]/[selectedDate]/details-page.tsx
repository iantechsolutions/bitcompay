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
import { useCompanyData } from "~/app/dashboard/[companyId]/company-provider";
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
  const [openAdd, setOpenAdd] = useState(false);
  const [percent, setPercent] = useState("");
  const [validity_date, setValidity_date] = useState<Date>();

  function handleUpdatePrice(value: string) {
    props.plan?.pricesPerCondition.forEach((price) => {
      createPricePerCondition({
        plan_id: props.plan?.id ?? "",
        amount: price.amount * (1 + parseFloat(percent) / 100),
        from_age: price.from_age ?? 0,
        to_age: price.to_age ?? 0,
        condition: price.condition ?? "",
        isAmountByAge: price.isAmountByAge,
        validy_date: validity_date ?? new Date(),
      });
    });
  }
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
              {formatter
                .format(props.plan!.pricesPerCondition.at(0)?.validy_date)
                .charAt(0)
                .toUpperCase() +
                formatter
                  .format(props.plan!.pricesPerCondition.at(0)?.validy_date)
                  .slice(1)}
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
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button onClick={() => handleUpdatePrice("edit")}>
                  Actualizar precio{" "}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
              //  onChange={(e)=>handleUpdatePrice(e.toS)}
              >
                <DropdownMenuItem
                // value="percent"
                >
                  <div onClick={() => setOpen(true)}>
                    Actualizar porcentualmente
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                // value="edit"
                >
                  <div onClick={() => setOpenAdd(true)}>Editar precio</div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {!isLoading && (
          <Tabs>
            <TabsList>
              <TabsTrigger value="conditional">
                Precios por relacion
              </TabsTrigger>
              <TabsTrigger value="perAge">Precios Por Edad</TabsTrigger>
            </TabsList>
            <TabsContent value="conditional">
              <LargeTable
                // height={height}
                headers={conditionHeaders}
                rows={
                  data!.filter((precio) => precio.isAmountByAge === false) ?? []
                }
              />
            </TabsContent>
            <TabsContent value="perAge">
              <LargeTable
                // height={height}
                headers={ageHeaders}
                rows={groupByAge!.filter((x: any) => !x.isConditional)}
              />
            </TabsContent>
          </Tabs>
        )}
      </section>
    </LayoutContainer>
  );
}
