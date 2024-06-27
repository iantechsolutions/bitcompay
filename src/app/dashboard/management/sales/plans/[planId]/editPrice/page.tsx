"use client";
import { useState } from "react";
import AddPlanPricesComponent from "../../add-planprices-component";
import { api } from "~/trpc/react";
import { GoBackArrow } from "~/components/goback-arrow";
import { useRouter } from "next/navigation";

export default function AddPlanPage(props: { params: { planId: string } }) {
  const [planId, setPlanId] = useState<string | undefined>(props.params.planId);
  const router = useRouter();
  const { data: planData } = api.plans.get.useQuery({ planId: planId ?? "" });
  const firstCorrectPrice = planData?.pricesPerCondition
    .sort((a, b) => b.validy_date.getTime() - a.validy_date.getTime())
    .filter((x) => x.validy_date.getTime() <= new Date().getTime())[0];
  const priceList = planData?.pricesPerCondition.filter(
    (x) => x.validy_date.getTime() == firstCorrectPrice?.validy_date.getTime()
  );

  async function handleChange() {
    router.push("./");
  }
  return (
    <div>
      <GoBackArrow />
      <AddPlanPricesComponent
        planId={props.params.planId}
        initialPrices={priceList}
        edit={false}
        date={firstCorrectPrice?.validy_date}
      ></AddPlanPricesComponent>
    </div>
  );
}
