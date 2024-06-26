"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import AddPlanPricesComponent from "../add-planprices-component";
import AddPlanInfoComponent from "../add-planinfo-component";
import { useState } from "react";

export default function AddPlanPage(props: { params: { planId: string } }) {
  const [planId, setPlanId] = useState<string | undefined>(undefined);
  return (
    <div>
      <Tabs>
        <TabsList>
          <TabsTrigger value="info">Informacion del plan</TabsTrigger>
          <TabsTrigger value="billing" disabled={!planId}>
            Precios
          </TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <AddPlanInfoComponent
            planId={planId}
            onPlanIdChange={setPlanId}
          ></AddPlanInfoComponent>
        </TabsContent>
        <TabsContent value="billing">
          <AddPlanPricesComponent planId={planId}></AddPlanPricesComponent>
        </TabsContent>
      </Tabs>
    </div>
  );
}
