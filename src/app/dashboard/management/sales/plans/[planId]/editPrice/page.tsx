import { api } from "~/trpc/server";
import AddPlanPricesComponent from "../../add-planprices-component";
import { GoBackArrow } from "~/components/goback-arrow";
import LayoutContainer from "~/components/layout-container";

export default async function AddPlanPage(props: {
  params: { planId: string };
}) {
  const planId = props.params.planId;

  // Fetch the plan data directly in the component
  const planData = await api.plans.get.query({ planId });

  if (!planData) {
    return <div>No se encontró el plan</div>;
  }

  // Find the first correct price
  const firstCorrectPrice = planData.pricesPerCondition
    .sort((a: any, b: any) => b.validy_date.getTime() - a.validy_date.getTime())
    .filter((x: any) => x.validy_date.getTime() <= new Date().getTime())[0];

  // Filter price list based on first correct price
  const priceList =
    planData.pricesPerCondition.filter(
      (x: any) =>
        x.validy_date.getTime() === firstCorrectPrice?.validy_date.getTime()
    ) ?? [];

  return (
    <LayoutContainer>
      <div>
        <GoBackArrow />
        <AddPlanPricesComponent
          planId={planId}
          initialPrices={priceList}
          edit={false}
          date={firstCorrectPrice?.validy_date}
        />
      </div>
    </LayoutContainer>
  );
}
