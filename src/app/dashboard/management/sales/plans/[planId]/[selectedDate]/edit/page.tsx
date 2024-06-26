import { Title } from "~/components/title";
import { api } from "~/trpc/server";

import EditPlanPage from "./edit-plan-page";

export default async function Page(props: {
  params: { planId: string; selectedDate: string };
}) {
  const { planId } = props.params;

  const selectedDate = new Date(Number(props.params.selectedDate));
  const initialPrices = await api.pricePerCondition.getByCreatedAt.query({
    createdAt: selectedDate,
    planId: planId,
  });
  if (!planId) {
    return <Title>No se encontró el plan</Title>;
  }

  return <EditPlanPage planId={planId} initialPrices={initialPrices} />;
}
