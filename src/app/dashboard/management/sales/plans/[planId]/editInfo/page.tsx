"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

import { useState } from "react";
import AddPlanInfoComponent from "../../add-planinfo-component";
import { GoBackArrow } from "~/components/goback-arrow";

export default function AddPlanPage(props: { params: { planId: string } }) {
  const [planId, setPlanId] = useState<string | undefined>(undefined);
  return (
    <div>
      <GoBackArrow />
      <AddPlanInfoComponent planId={props.params.planId}></AddPlanInfoComponent>
    </div>
  );
}
