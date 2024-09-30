"use client";
import { CirclePlus, Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { useForm, type SubmitHandler } from "react-hook-form";
import { PlanSchema } from "~/server/forms/plans-schema";
import { api } from "~/trpc/react";
import { useQueryClient } from "@tanstack/react-query";
import Edit02Icon from "~/components/icons/edit-02-stroke-rounded";
import { Label } from "~/components/ui/label";

type AddPlanDialogProps = {
  planId?: string;
  onPlanIdChange?: (planId: string) => void;
  closeDialog: () => void;
};

export default function AddPlanInfoComponent({
  planId,
  onPlanIdChange,
  closeDialog,
}: AddPlanDialogProps) {
  const [brand, setBrand] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [hasQueried, setHasQueried] = useState(false);
  const { data: planData } = api.plans.get.useQuery(
    { planId: planId ?? "" },
    {
      enabled: !!planId && !hasQueried,
      onSuccess: () => {
        setHasQueried(true);
      },
    }
  );

  useEffect(() => {
    if (planData) {
      setBrand(planData.brand_id ?? "");
      setCodigo(planData.plan_code);
      setDescripcion(planData.description);
    }
  }, [planData]);

  const { data: brands } = api.brands.list.useQuery();
  const { data: plans } = api.plans.list.useQuery();

  const { mutateAsync: createPlan, isLoading: isCreating } =
    api.plans.create.useMutation();
  const { mutateAsync: updatePlan, isLoading: isUpdating } =
    api.plans.change.useMutation();
  const router = useRouter();

  async function handleSubmit() {
    try {
      if (
        plans?.some((plan) => plan.plan_code === codigo && plan.id !== planId)
      ) {
        return toast.error("No se pueden repetir los códigos de los planes");
      } else {
        if (!brand || !codigo || !descripcion) {
          return toast.error("Ingrese la información de todos los campos");
        }
        if (planId) {
          await updatePlan({
            planId: planId,
            brand_id: brand,
            plan_code: codigo,
            description: descripcion,
          });
          toast.success("Plan actualizado correctamente");
        } else {
          const newPlan = await createPlan({
            brand_id: brand,
            plan_code: codigo,
            description: descripcion,
          });
          if (onPlanIdChange) {
            onPlanIdChange(newPlan[0]!.id);
          }
          toast.success("Plan creado correctamente");
        }
        router.refresh();
        closeDialog();
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="ml-2">
      <div className="w-full flex flex-row gap-2 text-gray-500">
        <div className="w-3/4 mb-2">
          <Label className="text-xs">MARCA</Label>
          <Select
            onValueChange={(value: string) => setBrand(value)}
            value={brand}
          >
            <SelectTrigger className="w-full mb-3 gap-3 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none hover:none justify-self-right">
              <SelectValue placeholder="Seleccione una marca" />
            </SelectTrigger>
            <SelectContent>
              {brands?.map((item) => (
                <SelectItem key={item?.id} value={item?.id}>
                  {item?.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="w-1/4 text-gray-500 mb-2">
        <Label className="text-xs">CÓDIGO</Label>
        <Input
          className="w-fit mb-5 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none hover:none justify-self-right"
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
      </div>
      <div className="w-1/4 text-gray-500 mt-2">
        <Label className="text-xs">DESCRIPCIÓN</Label>
        <Input
          className="w-fit mb-2 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none shadow-none hover:none justify-self-right"
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isCreating || isUpdating}
        className="mt-7 font-medium mb-2 rounded-full w-fit justify-self-right bg-[#BEF0BB] hover:bg-[#BEF0BB] text-[#3E3E3E]"
      >
        {isCreating || isUpdating ? (
          <Loader2Icon className="mr-2 animate-spin" size={20} />
        ) : (
          <>
            {planId ? (
              <Edit02Icon className="mr-2 h-4" />
            ) : (
              <CirclePlus className="mr-2" />
            )}
          </>
        )}
        {planId ? "Actualizar plan" : "Agregar Plan"}
      </Button>
    </div>
  );
}
