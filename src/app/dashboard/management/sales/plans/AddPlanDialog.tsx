"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import AddPlanPricesComponent from "./add-planprices-component";
import AddPlanInfoComponent from "./add-planinfo-component";
import { useState } from "react";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

export default function AddPlanPage(props: { params: { planId: string } }) {
  const [open, setOpen] = useState<boolean>(false);
  const [planId, setPlanId] = useState<string | undefined>(undefined);
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Agregar plan</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <Tabs>
            <TabsList>
              <TabsTrigger value="info">Informacion del plan</TabsTrigger>
              {planId && <TabsTrigger value="billing">Precios</TabsTrigger>}
            </TabsList>
            <TabsContent value="info">
              <AddPlanInfoComponent
                planId={planId}
                onPlanIdChange={setPlanId}></AddPlanInfoComponent>
            </TabsContent>
            <TabsContent value="billing">
              <AddPlanPricesComponent planId={planId}></AddPlanPricesComponent>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
