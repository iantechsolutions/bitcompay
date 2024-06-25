import { Title } from "~/components/title";
import { api } from "~/trpc/server";

import DetailsPage from "./details-page";

export default async function Page(props: {
  params: { planId: string; selectedDate: string };
}) {
  const { planId } = props.params;

  // Fetch the plan using the companyId and planId
  const plan = await api.plans.get.query({
    planId,
  });
  const DateNumber = parseInt(props.params.selectedDate, 10);
  const selectedDate = new Date(DateNumber);

  if (!plan) {
    return <Title>No se encontró el plan</Title>;
  }

  return <DetailsPage plan={plan} date={selectedDate} />;
}
