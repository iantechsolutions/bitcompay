"use client";
import { useEffect, useState } from "react";
import AddPlanPricesComponent from "../../add-planprices-component";
import { api } from "~/trpc/react";
import { GoBackArrow } from "~/components/goback-arrow";
import { useRouter } from "next/navigation";
import LayoutContainer from "~/components/layout-container";

export default function AddPlanPage(props: { params: { planId: string } }) {
  const [planId, setPlanId] = useState<string | undefined>(props.params.planId);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [firstCorrectPrice, setFirstCorrectPrice] = useState<any>();
  const [hasQueried, setHasQueried] = useState(false);
  const router = useRouter();
  const { data: planData } = api.plans.get.useQuery(
    { planId: planId ?? "" },
    {
      enabled: !!planId && !hasQueried,
      onSuccess: () => {
        setHasQueried(true);
      },
    }
  );
  useEffect(() => {
    const firstCorrect = planData?.pricesPerCondition
      .sort((a, b) => b.validy_date.getTime() - a.validy_date.getTime())
      .filter((x) => x.validy_date.getTime() <= new Date().getTime())[0];
    setFirstCorrectPrice(firstCorrect);
    setPriceList(
      planData?.pricesPerCondition.filter(
        (x) =>
          x.validy_date.getTime() == firstCorrectPrice?.validy_date.getTime()
      ) ?? []
    );
  }, [planData]);

  async function handleChange() {
    router.push("./");
    router.refresh();
  }
  return (
    <LayoutContainer>
      <div>
        <GoBackArrow />
        <AddPlanPricesComponent
          planId={props.params.planId}
          initialPrices={priceList}
          edit={false}
          date={firstCorrectPrice?.validy_date}
          onPricesChange={() => handleChange()}
        ></AddPlanPricesComponent>
      </div>
    </LayoutContainer>
  );
}
