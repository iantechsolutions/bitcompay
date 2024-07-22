"use client";
import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { api } from "~/trpc/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
import { useRouter } from "next/navigation";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RouterOutputs } from "~/trpc/shared";
import { CircleX, Loader2Icon, PlusCircle } from "lucide-react";

dayjs.extend(utc);
dayjs.locale("es");

type FormValues = {
  prices: {
    id: string;
    createdAt: Date;
    validy_date: Date;
    from_age: number | null;
    to_age: number | null;
    condition: string | null;
    isAmountByAge: boolean;
    plan_id: string | null;
    amount: number;
  }[];
};

type AddPlanDialogProps = {
  initialPrices?: RouterOutputs["pricePerCondition"]["list"];
  planId?: string;
  edit?: boolean;
  date?: Date;
  onPricesChange?: () => void;
};

export default function AddPlanPricesComponent({
  initialPrices,
  planId,
  edit,
  date,
  onPricesChange,
}: AddPlanDialogProps) {
  const [anio, setAnio] = useState(date?.getFullYear() ?? 2020);
  const [mes, setMes] = useState((date?.getMonth() ?? 0) + 1);
  const router = useRouter();
  const [working, setWorking] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: { prices: initialPrices || [] },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prices",
  });

  const { data: relatives } = api.relative.list.useQuery(undefined);
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

  const { mutateAsync: createPricePerCondition } =
    api.pricePerCondition.create.useMutation();
  const { mutateAsync: updatePricePerCondition } =
    api.pricePerCondition.change.useMutation();

  // Add logging to check for re-renders
  useEffect(() => {
    console.log("Component mounted or updated");
  });

  useEffect(() => {
    if (initialPrices) {
      console.log("Setting initial prices");
      form.reset({ prices: initialPrices });
    }
  }, [initialPrices]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setWorking(true);
      const validity_date = new Date(anio, mes - 1, 1);
      for (const item of data.prices) {
        if (edit && item.id !== "") {
          if (item.isAmountByAge) {
            await updatePricePerCondition({
              id: item.id,
              from_age: Number(item.from_age),
              to_age: Number(item.to_age),
              amount: Number(item.amount),
              plan_id: planId ?? "",
              isAmountByAge: true,
              validy_date: dayjs.utc(validity_date).toDate(),
            });
          } else {
            await updatePricePerCondition({
              id: item.id,
              condition: item.condition ?? "",
              amount: Number(item.amount),
              plan_id: planId ?? "",
              isAmountByAge: false,
              validy_date: dayjs.utc(validity_date).toDate(),
            });
          }
        } else {
          if (item.isAmountByAge) {
            await createPricePerCondition({
              from_age: Number(item.from_age),
              to_age: Number(item.to_age),
              amount: Number(item.amount),
              plan_id: planId ?? "",
              isAmountByAge: true,
              validy_date: dayjs.utc(validity_date).toDate(),
            });
          } else {
            await createPricePerCondition({
              condition: item.condition ?? "",
              amount: Number(item.amount),
              plan_id: planId ?? "",
              isAmountByAge: false,
              validy_date: dayjs.utc(validity_date).toDate(),
            });
          }
        }
      }
      if (onPricesChange) {
        onPricesChange();
      }
      setWorking(false);
    } catch (error) {
      console.error(error);
      setWorking(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-col items-center justify-center gap-2 space-y-8"
        >
          <div className="flex flex-row space-x-24">
            <FormItem>
              <FormLabel htmlFor="validy_date">Mes de vigencia</FormLabel>
              <Select
                disabled={edit}
                onValueChange={(e) => setMes(Number(e))}
                value={mes.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un mes" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Enero</SelectItem>
                  <SelectItem value="2">Febrero</SelectItem>
                  <SelectItem value="3">Marzo</SelectItem>
                  <SelectItem value="4">Abril</SelectItem>
                  <SelectItem value="5">Mayo</SelectItem>
                  <SelectItem value="6">Junio</SelectItem>
                  <SelectItem value="7">Julio</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Septiembre</SelectItem>
                  <SelectItem value="10">Octubre</SelectItem>
                  <SelectItem value="11">Noviembre</SelectItem>
                  <SelectItem value="12">Diciembre</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
            <FormItem>
              <FormLabel>Año de Vigencia</FormLabel>
              <FormControl>
                <Input
                  disabled={edit}
                  className="border-green-300 focus-visible:ring-green-400 w-[100px]"
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
          <div className="mb-10">
            <Button
              type="button"
              className="float-right"
              onClick={() =>
                append({
                  id: "",
                  createdAt: new Date(),
                  validy_date: new Date(),
                  from_age: null,
                  to_age: null,
                  condition: "",
                  isAmountByAge: false,
                  plan_id: "",
                  amount: 0,
                })
              }
            >
              <PlusCircle className="mr-2" size={20} />
              Agregar Precio
            </Button>
            {fields.length > 0 && (
              <h1 className="font-bold text-2xl">Condicion</h1>
            )}
          </div>
          {fields.map((item, index) => {
            const isAmountByAge = form.watch(`prices.${index}.isAmountByAge`);
            return (
              <div key={item.id} className="flex space-x-4 items-center">
                <div className="w-[300px]">
                  <FormField
                    control={form.control}
                    name={`prices.${index}.isAmountByAge`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel
                          htmlFor={`prices.${index}.isAmountByAge`}
                          className="font-bold"
                        >
                          Tipo
                        </FormLabel>
                        <Select
                          onValueChange={(value: "true" | "false") => {
                            const boolValue = value === "true";
                            form.setValue(
                              `prices.${index}.isAmountByAge`,
                              boolValue
                            );
                            if (boolValue) {
                              form.setValue(`prices.${index}.condition`, null);
                            } else {
                              form.setValue(`prices.${index}.from_age`, null);
                              form.setValue(`prices.${index}.to_age`, null);
                            }
                          }}
                          value={
                            form.getValues(`prices.${index}.isAmountByAge`)
                              ? "true"
                              : "false"
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-[150px] font-bold">
                              <SelectValue placeholder="Seleccione una opción" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem
                              value="true"
                              className="rounded-none border-b border-gray-600"
                            >
                              Rango de edad
                            </SelectItem>
                            <SelectItem
                              value="false"
                              className="rounded-none border-b border-gray-600"
                            >
                              Parentesco
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {!isAmountByAge ? (
                  <FormField
                    control={form.control}
                    name={`prices.${index}.condition`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor={`prices.${index}.condition`}>
                          Relacion
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? ""}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione una opción" />
                            </SelectTrigger>
                            <SelectContent>
                              {relatives?.map((relative) => (
                                <SelectItem
                                  key={relative.relation}
                                  value={relative.relation ?? ""}
                                >
                                  {relative.relation}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name={`prices.${index}.from_age`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor={`prices.${index}.from_age`}>
                            Edad Desde
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="border-green-300 focus-visible:ring-green-400"
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`prices.${index}.to_age`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor={`prices.${index}.to_age`}>
                            Edad Hasta
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="border-green-300 focus-visible:ring-green-400"
                              type="number"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <FormField
                  control={form.control}
                  name={`prices.${index}.amount`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor={`prices.${index}.amount`}>
                        Precio
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-green-300 focus-visible:ring-green-400 w-[100px]"
                          type="number"
                          {...field}
                          value={field.value?.toString()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  variant="ghost"
                  type="button"
                  className="relative top-3"
                  onClick={() => remove(index)}
                >
                  <CircleX className="text-red-500 left-0" size={20} />
                </Button>
              </div>
            );
          })}
          <Button type="submit" disabled={working}>
            {" "}
            {working && (
              <Loader2Icon className="mr-2 animate-spin" size={20} />
            )}{" "}
            {edit ? "Actualizar" : "Guardar"}
          </Button>
        </form>
      </Form>
    </>
  );
}
