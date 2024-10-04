"use server";
import { api } from "~/trpc/server";

import PlanPage from "./plan-page";
import LayoutContainer from "~/components/layout-container";

export default async function Page(props: { params: { planId: string } }) {
  const { planId } = props.params;

  const plan = await api.plans.get.query({
    planId,
  });

  if (!plan) {
    return (
      <LayoutContainer>
        <div>No se encontró el plan</div>;
      </LayoutContainer>
    );
  }
  return (
    <div>
      <PlanPage plan={plan} />
    </div>
  );
}
