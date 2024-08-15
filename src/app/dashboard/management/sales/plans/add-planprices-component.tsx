"use client";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
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
  const [anio, setAnio] = useState<number | null>(2024 ?? null);
  const [mes, setMes] = useState<number | null>(null);
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
  const [currentVigency, setCurrentVigency] = useState(new Date());
  const { data: planData } = api.plans.get.useQuery(
    { planId: planId ?? "" },
    {
      enabled: !!planId && !hasQueried,
      onSuccess: () => {
        setHasQueried(true);
        const futurosVigency = planData?.pricesPerCondition?.filter(
          (x) => x.validy_date < new Date()
        );
        if (futurosVigency) {
          const currentVigency = futurosVigency?.sort(
            (a, b) => b.validy_date.getTime() - a.validy_date.getTime()
          )[0];
          setCurrentVigency(currentVigency?.validy_date ?? new Date());
        }
      },
    }
  );

  const { mutateAsync: createPricePerCondition } =
    api.pricePerCondition.create.useMutation();
  const { mutateAsync: updatePricePerCondition } =
    api.pricePerCondition.change.useMutation();
  // Add logging to check for re-renders

  useEffect(() => {
    if (initialPrices) {
      form.reset({ prices: initialPrices });
    }
  }, [initialPrices]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setWorking(true);

      let allowed = true;
      const validity_date = new Date(anio ?? 0, mes ?? 1 - 1, 1);
      for (let i = 0; i < data.prices.length; i++) {
        console.log("entra for");
        const { from_age: fromAge1, to_age: toAge1 } = data.prices[i] ?? {
          from_age: 0,
          to_age: 0,
        };
        if (fromAge1 !== null && toAge1 !== null) {
          for (let j = i + 1; j < data.prices.length; j++) {
            const { from_age: fromAge2, to_age: toAge2 } = data.prices[j] ?? {
              from_age: 0,
              to_age: 0,
            };
            console.log(fromAge1);
            console.log(fromAge2);
            console.log(toAge1);
            console.log(toAge2);
            if (fromAge2 !== null && toAge2 !== null) {
              if (
                (fromAge1 <= toAge2 && toAge1 >= fromAge2) ||
                (fromAge2 <= toAge1 && toAge2 >= fromAge1) ||
                (fromAge2 >= fromAge1 && toAge2 <= toAge1) ||
                (fromAge1 >= fromAge2 && toAge1 <= toAge2)
              ) {
                toast.error("Las edades se superposicionan");
                allowed = false;
              }
            }
          }
        }
      }

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
          <div className="mb-1">
            <Button
              type="button"
              className="float-right bg-[#1bdfb7] hover:bg-[#1bdfb7] rounded-full"
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

            <h1 className="font-bold text-2xl">Editar Precio Manualmente</h1>
          </div>
          <div className="flex flex-row gap-5">
            <FormItem>
              <FormLabel htmlFor="validy_date">Mes de vigencia</FormLabel>
              <Select
                disabled={edit}
                onValueChange={(e) => setMes(Number(e))}
                value={mes?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un mes" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem
                    value="1"
                    disabled={new Date(anio ?? 0, 0, 1) < currentVigency}
                  >
                    Enero
                  </SelectItem>
                  <SelectItem
                    value="2"
                    disabled={new Date(anio ?? 0, 1, 1) < currentVigency}
                  >
                    Febrero
                  </SelectItem>
                  <SelectItem
                    value="3"
                    disabled={new Date(anio ?? 0, 2, 1) < currentVigency}
                  >
                    Marzo
                  </SelectItem>
                  <SelectItem
                    value="4"
                    disabled={new Date(anio ?? 0, 3, 1) < currentVigency}
                  >
                    Abril
                  </SelectItem>
                  <SelectItem
                    value="5"
                    disabled={new Date(anio ?? 0, 4, 1) < currentVigency}
                  >
                    Mayo
                  </SelectItem>
                  <SelectItem
                    value="6"
                    disabled={new Date(anio ?? 0, 5, 1) < currentVigency}
                  >
                    Junio
                  </SelectItem>
                  <SelectItem
                    value="7"
                    disabled={new Date(anio ?? 0, 6, 1) < currentVigency}
                  >
                    Julio
                  </SelectItem>
                  <SelectItem
                    value="8"
                    disabled={new Date(anio ?? 0, 7, 1) < currentVigency}
                  >
                    Agosto
                  </SelectItem>
                  <SelectItem
                    value="9"
                    disabled={new Date(anio ?? 0, 8, 1) < currentVigency}
                  >
                    Septiembre
                  </SelectItem>
                  <SelectItem
                    value="10"
                    disabled={new Date(anio ?? 0, 9, 1) < currentVigency}
                  >
                    Octubre
                  </SelectItem>
                  <SelectItem
                    value="11"
                    disabled={new Date(anio ?? 0, 10, 1) < currentVigency}
                  >
                    Noviembre
                  </SelectItem>
                  <SelectItem
                    value="12"
                    disabled={new Date(anio ?? 0, 11, 1) < currentVigency}
                  >
                    Diciembre
                  </SelectItem>
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
                  value={anio?.toString()}
                  onChange={(e) => setAnio(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
          {fields.length > 0 && (
            <h1 className="font-bold text-2xl">Condicion</h1>
          )}
          {fields.map((item, index) => {
            const isAmountByAge = form.watch(`prices.${index}.isAmountByAge`);
            return (
              <div key={item.id} className="flex items-center gap-5">
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
