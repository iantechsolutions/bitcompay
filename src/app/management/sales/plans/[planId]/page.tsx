"use server";
import { Title } from "~/components/title";
import { api } from "~/trpc/server";

import PlanPage from "./plan-page";

export default async function Page(props: { params: { planId: string } }) {
  const { planId } = props.params;

  const plan = await api.plans.get.query({
    planId,
  });
  return (
    <div>
      <PlanPage plan={plan} />
    </div>
  );
}
