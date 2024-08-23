"use client";
import { useEffect, useState } from "react";
import AddPlanPricesComponent from "../../../../add-planprices-component";
import { api } from "~/trpc/react";
import { GoBackArrow } from "~/components/goback-arrow";
import { useRouter } from "next/navigation";
import LayoutContainer from "~/components/layout-container";
export default function AddPlanPage(props: {
  params: { planId: string; selectedDate: string };
}) {
  const router = useRouter();
  const [planId, setPlanId] = useState<string | undefined>(props.params.planId);
  const [priceList, setPriceList] = useState<any[]>([]);
  const date = new Date(Number(props.params.selectedDate));
  const [hasQueried, setHasQueried] = useState(false);
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
    setPriceList(
      planData?.pricesPerCondition.filter(
        (x) => x.validy_date.getTime() == date.getTime()
      ) ?? []
    );
  }, [planData]);
  return (
    <LayoutContainer>
      <div>
        <GoBackArrow />
        <AddPlanPricesComponent
          planId={props.params.planId}
          initialPrices={priceList}
          edit={true}
          date={date}
          onPricesChange={() => router.push("./")}
        ></AddPlanPricesComponent>
      </div>
    </LayoutContainer>
  );
}
