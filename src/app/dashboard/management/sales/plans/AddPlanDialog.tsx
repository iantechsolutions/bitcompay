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
import { DialogTrigger } from "@radix-ui/react-dialog";
import Edit02Icon from "~/components/icons/edit-02-stroke-rounded";

export default function AddPlanDialog(props: { planId?: string }) {
  const router = useRouter();
  //local state
  const [open, setOpen] = useState(false);
  const [planId, setPlanId] = useState<string | undefined>(props.planId);
  const queryClient = useQueryClient();

  async function handleChange() {
    setOpen(false);

    queryClient.invalidateQueries();
  }

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          {planId ? (
            <Button className="bg-transparent hover:bg-transparent p-0 text-[#3e3e3e] shadow-none h-5">
              <Edit02Icon className="mr-1 h-4" /> Actualizar Info
            </Button>
          ) : (
            <Button
              onClick={() => setOpen(true)}
              className=" bg-[#BEF0BB] hover:bg-[#BEF0BB]  rounded-full text-[#3E3E3E] hover:text-[#3E3E3E]">
              <PlusCircleIcon className="mr-2" size={20} strokeWidth={1} />
              Agregar plan
            </Button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="ml-2">
              {planId ? "Actualizar plan" : "Crear un plan"}
            </DialogTitle>
          </DialogHeader>
          <AddPlanInfoComponent
            planId={planId}
            onPlanIdChange={() => handleChange()}
            closeDialog={() => handleChange()}></AddPlanInfoComponent>
        </DialogContent>
      </Dialog>
    </div>
  );
}
