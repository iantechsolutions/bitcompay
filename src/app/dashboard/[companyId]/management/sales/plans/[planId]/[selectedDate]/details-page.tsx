"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import SelectPercentDialog from "./select-percent-dialog";

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
  function handleUpdatePrice(value: string) {
    if (value === "percent") {
    } else {
    }
  }
  useEffect(() => {
    const groupByAge: GroupedPlans[] = [];
    let savedPrice = -1;
    props.plan?.pricesPerAge
      ?.filter((precio) => precio.isAmountByAge === true)
      .sort((a, b) => (a.age ?? 0) - (b.age ?? 0))
      .forEach((price) => {
        if (price.amount !== savedPrice) {
          groupByAge.push({
            from_age: price.age ?? 0,
            to_age: price.age ?? 0,
            amount: price.amount,
          });
          savedPrice = price.amount;
        } else if (groupByAge.length > 0) {
          const last = groupByAge[groupByAge.length - 1];
          last!.to_age = price.age ?? 0;
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
                .format(props.plan!.pricesPerAge.at(0)?.validy_date)
                .charAt(0)
                .toUpperCase() +
                formatter
                  .format(props.plan!.pricesPerAge.at(0)?.validy_date)
                  .slice(1)}
            </h2>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>Actualizar precio</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
              //  onChange={(e)=>handleUpdatePrice(e.toS)}
              >
                <DropdownMenuItem
                // value="percent"
                >
                  <SelectPercentDialog />
                </DropdownMenuItem>

                <DropdownMenuItem
                // value="edit"
                >
                  Actualizar a otra cantidad
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs>
          <TabsList>
            <TabsTrigger value="conditional">Precios por relacion</TabsTrigger>
            <TabsTrigger value="perAge">Precios Por Edad</TabsTrigger>
          </TabsList>
          <TabsContent value="conditional">
            <LargeTable
              // height={height}
              headers={conditionHeaders}
              rows={
                props.plan?.pricesPerAge.filter(
                  (precio) => precio.isAmountByAge === false
                ) ?? []
              }
            />
          </TabsContent>
          <TabsContent value="perAge">
            <LargeTable
              // height={height}
              headers={ageHeaders}
              rows={groupByAge}
            />
          </TabsContent>
        </Tabs>
      </section>
    </LayoutContainer>
  );
}
