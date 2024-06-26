"use client";
import { useState } from "react";
import AddPlanPricesComponent from "../../../../../add-planprices-component";
import { api } from "~/trpc/react";

export default function AddPlanPage(props: {
  params: { planId: string; selectedDate: string };
}) {
  const [planId, setPlanId] = useState<string | undefined>(props.params.planId);
  const { data: planData } = api.plans.get.useQuery({ planId: planId ?? "" });
  const date = new Date(Number(props.params.selectedDate));
  console.log(date);
  console.log("priceList");
  const priceList = planData?.pricesPerCondition.filter(
    (x) => x.validy_date.getTime() == date.getTime()
  );
  console.log(priceList);
  return (
    <div>
      <h1>Bienvenido</h1>
      <AddPlanPricesComponent
        planId={props.params.planId}
        initialPrices={priceList}
        edit={true}
        date={date}
      ></AddPlanPricesComponent>
    </div>
  );
}
