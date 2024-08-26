"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import AddPlanInfoComponent from "./add-planinfo-component";
import { useQueryClient } from "@tanstack/react-query";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { PlusCircleIcon, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddPlanDialog(props: { planId?: string }) {
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const [planId, setPlanId] = useState<string | undefined>(props.planId);
  const queryClient = useQueryClient();

  async function handleChange() {
    setOpen(false);
    queryClient.invalidateQueries();
  }
  return (
    <div>
      <Button
        onClick={() => setOpen(true)}
        className=" bg-[#BEF0BB] hover:bg-[#BEF0BB]  rounded-full text-[#3E3E3E] hover:text-[#3E3E3E]"
      >
        {planId ? (
          <>
            <Pencil className="mr-2" size={20} strokeWidth={1} />
            Actualizar info
          </>
        ) : (
          <>
            <PlusCircleIcon className="mr-2" size={20} strokeWidth={1} />
            Agregar plan
          </>
        )}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {planId ? "Actualizar plan" : "Crear un plan"}
            </DialogTitle>
          </DialogHeader>
          <AddPlanInfoComponent
            planId={planId}
            onPlanIdChange={() => handleChange()}
            closeDialog={() => handleChange()}
          ></AddPlanInfoComponent>
        </DialogContent>
      </Dialog>
    </div>
  );
}
