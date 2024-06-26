"use client";
import { useState } from "react";
import AddPlanPricesComponent from "../../../add-planprices-component";

export default function AddPlanPage(props: { params: { planId: string } }) {
  const [planId, setPlanId] = useState<string | undefined>(undefined);
  return (
    <div>
      <h1>Bienvenido</h1>
      <AddPlanPricesComponent
        planId={props.params.planId}
        initialPrices={[]}></AddPlanPricesComponent>
    </div>
  );
}
