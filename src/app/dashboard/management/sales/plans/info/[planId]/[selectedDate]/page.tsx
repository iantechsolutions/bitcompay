import { Title } from "~/components/title";
import { api } from "~/trpc/server";

import DetailsPage from "./details-page";
import EditPlanPage from "./edit-plans";

export default async function Page(props: {
  params: { planId: string; selectedDate: string };
}) {
  const { planId } = props.params;

  // Fetch the plan using the companyId and planId
  const plan = await api.plans.get.query({
    planId,
  });
  console.log(props.params.selectedDate);
  const selectedDate = new Date(Number(props.params.selectedDate));
  console.log("selectedDate");
  console.log(selectedDate);
  if (!plan) {
    return <Title>No se encontró el plan</Title>;
  }
  if (props.params.selectedDate == "edit") {
    return <EditPlanPage plan={plan} />;
  }

  return <DetailsPage plan={plan} date={selectedDate} />;
}
