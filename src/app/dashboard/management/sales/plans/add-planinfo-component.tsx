"use client";
import { CircleX, PlusCircle, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
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
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
// import { CalendarByMountAndYear } from "~/components/ui/calendarMonthAndYear";
import { Input } from "~/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { useForm, type SubmitHandler } from "react-hook-form";
import { PlanSchema } from "~/server/forms/plans-schema";
import { api } from "~/trpc/react";
import { useCompanyData } from "../../../company-provider";
import { useFieldArray } from "react-hook-form";
import { Label } from "~/components/ui/label";
import { RouterOutputs } from "~/trpc/shared";

dayjs.extend(utc);
dayjs.locale("es");

type AddPlanDialogProps = {
  planId?: string;
};

export default async function AddPlanInfoComponent({
  planId,
}: AddPlanDialogProps) {
  const company = useCompanyData();
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

  const { data: brands } = api.brands.getbyCompany.useQuery({
    companyId: company.id,
  });
  const { mutateAsync: createPlan } = api.plans.create.useMutation();
  const { mutateAsync: updatePlan } = api.plans.change.useMutation();

  async function handleSumbit() {
    if (planId) {
      const plan = await updatePlan({
        planId: planId,
        brand_id: brand,
        plan_code: codigo,
        description: descripcion,
      });
    } else {
      const plan = await createPlan({
        brand_id: brand,
        plan_code: codigo,
        description: descripcion,
      });
    }
  }

  return (
    <>
      <div>
        <Label>Marca</Label>
        <Select
          onValueChange={(value: string) => setBrand(value)}
          value={brand}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione una marca" />
          </SelectTrigger>
          <SelectContent>
            {brands?.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Codigo</Label>
        <Input
          className="border-green-300 focus-visible:ring-green-400 w-[100px]"
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
      </div>
      <div>
        <Label>Descripcion</Label>
        <Input
          className="border-green-300 focus-visible:ring-green-400 w-[100px]"
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>
    </>
  );
}
