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
import Edit02Icon from "~/components/icons/edit-02-stroke-rounded";
import { GoBackButton } from "~/components/goback-button";

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
};

export default function AddPlanPricesComponent({
  initialPrices,
  planId,
  edit,
  date,
}: AddPlanDialogProps) {
  const [anio, setAnio] = useState<number | null>(date?.getFullYear() ?? 2024);
  let number = 2;
  if (edit) {
    number = 1;
  }
  const [mes, setMes] = useState<number | null>(
    date ? date.getMonth() + number : 1
  );

  const [formData, setFormData] = useState<FormValues>({
    prices: initialPrices || [],
  });

  const router = useRouter();
  const [working, setWorking] = useState(false);
  const form = useForm<FormValues>({
    defaultValues: { prices: initialPrices || [] },
  });
  function onPricesChange() {
    router.push("./");
    router.refresh();
  }
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "prices",
  });

  const { data: relatives } = api.relative.list.useQuery(undefined);
  const [hasQueried, setHasQueried] = useState(false);
  const [currentVigency, setCurrentVigency] = useState(new Date(1, 1, 2000));
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
          setCurrentVigency(
            currentVigency?.validy_date ?? new Date(1, 1, 2000)
          );
        }

        router.refresh();
      },
    }
  );

  const Bookmark02Icon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      color={"#000000"}
      fill={"none"}
      {...props}>
      <path
        d="M4 17.9808V9.70753C4 6.07416 4 4.25748 5.17157 3.12874C6.34315 2 8.22876 2 12 2C15.7712 2 17.6569 2 18.8284 3.12874C20 4.25748 20 6.07416 20 9.70753V17.9808C20 20.2867 20 21.4396 19.2272 21.8523C17.7305 22.6514 14.9232 19.9852 13.59 19.1824C12.8168 18.7168 12.4302 18.484 12 18.484C11.5698 18.484 11.1832 18.7168 10.41 19.1824C9.0768 19.9852 6.26947 22.6514 4.77285 21.8523C4 21.4396 4 20.2867 4 17.9808Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const { mutateAsync: createPricePerCondition } =
    api.pricePerCondition.create.useMutation();
  const { mutateAsync: updatePricePerCondition } =
    api.pricePerCondition.change.useMutation();
  const { mutateAsync: deletePricePerCondition } =
    api.pricePerCondition.delete.useMutation();

  const [pricesToDelete, setPricesToDelete] = useState<string[]>([]);
  // Add logging to check for re-renders

  // const [trues, setTrues] = useState(true);
  useEffect(() => {
    if (edit && initialPrices) {
      setFormData({ prices: initialPrices });
      form.reset({ prices: initialPrices });

      const givenDate = initialPrices[0]?.validy_date;
      if ((givenDate?.getTime() ?? 0) > new Date().getTime()) {
        if (initialPrices[0]?.validy_date.getMonth()) {
          setMes(initialPrices[0]?.validy_date.getMonth() + 1);
        } else {
          setMes(null);
        }
        setAnio(initialPrices[0]?.validy_date.getFullYear() ?? null);
      }
    }
  }, [edit, initialPrices, form, working]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      setWorking(true);
      if (!mes && !edit) {
        toast.error("ingrese el mes correspondiente");
        setWorking(false);
      } else if (data.prices.length < 1) {
        toast.error("ingrese al menos un precio");
        setWorking(false);
      } else {
        let allowed = true;
        console.log("start");
        data.prices.sort((a, b) => (a.from_age ?? 0) - (b.from_age ?? 0));
        console.log("emnding");

        const validity_date = new Date(anio ?? 0, (mes ?? 1) - 1, 1);
        for (let i = 0; i < data.prices.length; i++) {
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

              if (fromAge2 !== null && toAge2 !== null) {
                if (fromAge1 <= toAge2 && fromAge2 <= toAge1) {
                  toast.error("Las edades se superposicionan");
                  allowed = false;
                }
              }
            }
          }
        }
        if (allowed) {
          for (const item of data.prices) {
            if (edit && item.id !== "") {
              // if (!pricesToDelete.includes(item.id)) {
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
              // }
            }
          }
          if (onPricesChange) {
            onPricesChange();
          }
        }
        setWorking(false);
      }
    } catch (error) {
      setWorking(false);
    }
  };
  // useEffect(() => {}, [pricesToDelete]);

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleDelete = async (index: number) => {
    if (isButtonDisabled) {
      return null;
    }
    setIsButtonDisabled(true);
    try {
      const price = initialPrices?.[index];
      if (price?.id) {
        await deletePricePerCondition({ id: price?.id ?? "" });
        remove(index);
      } else {
        remove(index);
      }
    } catch {
      toast.error("No se pudo eliminar el precio");
    } finally {
      setTimeout(() => setIsButtonDisabled(false), 2000);
    }
  };

  return (
    <>
      <GoBackButton url={"./"} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-col items-center justify-center gap-2 space-y-4">
          <div className="p-0.5">
            <h1 className="flex-col items-center justify-center gap-2 space-y-2 font-bold text-2xl">
              Editar Precio Manualmente
            </h1>
            {fields.length === 0 && (
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
                }>
                <PlusCircle className="text-green-500 left-0" size={20} />
                Agregar Precio
              </Button>
            )}
          </div>
          <div className="flex flex-row w-full text-gray-500 p-2 gap-4">
            <div className="w-1/4 whitespace-nowrap ">
              <FormItem>
                <Label htmlFor="validy_date" className="text-xs">
                  MES DE VIGENCIA
                </Label>
                <Select
                  disabled={edit}
                  onValueChange={(e) => setMes(Number(e))}
                  defaultValue={mes?.toString() || "0"}>
                  <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none hover:bg-transparent">
                    <SelectValue placeholder="Seleccione un mes" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[45vh] mb-2">
                    <SelectItem
                      value="1"
                      disabled={new Date(anio ?? 0, 0, 1) <= currentVigency}>
                      Enero
                    </SelectItem>
                    <SelectItem
                      value="2"
                      disabled={new Date(anio ?? 0, 1, 1) <= currentVigency}>
                      Febrero
                    </SelectItem>
                    <SelectItem
                      value="3"
                      disabled={new Date(anio ?? 0, 2, 1) <= currentVigency}>
                      Marzo
                    </SelectItem>
                    <SelectItem
                      value="4"
                      disabled={new Date(anio ?? 0, 3, 1) <= currentVigency}>
                      Abril
                    </SelectItem>
                    <SelectItem
                      value="5"
                      disabled={new Date(anio ?? 0, 4, 1) <= currentVigency}>
                      Mayo
                    </SelectItem>
                    <SelectItem
                      value="6"
                      disabled={new Date(anio ?? 0, 5, 1) <= currentVigency}>
                      Junio
                    </SelectItem>
                    <SelectItem
                      value="7"
                      disabled={new Date(anio ?? 0, 6, 1) <= currentVigency}>
                      Julio
                    </SelectItem>
                    <SelectItem
                      value="8"
                      disabled={new Date(anio ?? 0, 7, 1) <= currentVigency}>
                      Agosto
                    </SelectItem>
                    <SelectItem
                      value="9"
                      disabled={new Date(anio ?? 0, 8, 1) <= currentVigency}>
                      Septiembre
                    </SelectItem>
                    <SelectItem
                      value="10"
                      disabled={new Date(anio ?? 0, 9, 1) <= currentVigency}>
                      Octubre
                    </SelectItem>
                    <SelectItem
                      value="11"
                      disabled={new Date(anio ?? 0, 10, 1) <= currentVigency}>
                      Noviembre
                    </SelectItem>
                    <SelectItem
                      value="12"
                      disabled={new Date(anio ?? 0, 11, 1) <= currentVigency}>
                      Diciembre
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            </div>
            <div className="w-1/4 ml-3 mt-2 whitespace-nowrap max-w-fit">
              <Label className="text-xs">AÑO DE VIGENCIA</Label>
              <FormItem className="w-full max-w-24 border-green-300 border-b text-[#3E3E3E] bg-background rounded-none hover:bg-transparent">
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
          </div>

          {fields.length > 0 && (
            <h1 className="flex-col items-center justify-center gap-2 space-y-4 font-bold text-2xl p-0.5 mb-2">
              Condición
            </h1>
          )}
          {hasQueried ? (
            fields.map((item, index) => {
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
                          className="text-xs text-gray-500">
                          TIPO
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
                          }>
                          <FormControl>
                            <SelectTrigger className="w-full border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none hover:bg-transparent">
                              <SelectValue placeholder="Seleccione una opción" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true" className="rounded-none ">
                              Rango de edad
                            </SelectItem>
                            <SelectItem value="false" className="rounded-none">
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
                          <FormLabel
                            htmlFor={`prices.${index}.condition`}
                            className="text-xs text-gray-500">
                            RELACIÓN
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? ""}>
                              <SelectTrigger className="w-full px-3 max-w-fit border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none hover:bg-transparent">
                                <SelectValue placeholder="Seleccione una opción" />
                              </SelectTrigger>
                              <SelectContent>
                                {relatives?.map((relative) => (
                                  <SelectItem
                                    key={relative.relation}
                                    value={relative.relation ?? ""}>
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
                          <FormItem className="max-w-fit p-3">
                            <FormLabel
                              htmlFor={`prices.${index}.from_age`}
                              className="text-xs text-gray-500">
                              EDAD DESDE
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="w-full max-w-24 border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none hover:bg-transparent"
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
                          <FormItem className="max-w-fit p-3">
                            <FormLabel
                              htmlFor={`prices.${index}.to_age`}
                              className="text-xs text-gray-500 max-w-fit">
                              EDAD HASTA
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="w-full max-w-24 border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none hover:bg-transparent"
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
                        <FormLabel
                          htmlFor={`prices.${index}.amount`}
                          className="text-xs text-gray-500">
                          PRECIO
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="w-full max-w-24 border-green-300 border-0 border-b text-[#3E3E3E] bg-background rounded-none
              hover:none justify-self-right pr-0 hover:bg-transparent"
                            type="number"
                            min="0"
                            {...field}
                            value={field.value?.toString()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      type="button"
                      className="relative top-3 hover:bg-transparent"
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
                      }>
                      {isButtonDisabled || working ? (
                        <Loader2Icon
                          className="left-0 animate-spin"
                          size={20}
                        />
                      ) : (
                        <PlusCircle
                          className="text-green-500 left-0"
                          size={20}
                        />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      type="button"
                      className="relative top-3 hover:bg-transparent"
                      onClick={() => handleDelete(index)}>
                      {isButtonDisabled || working ? (
                        <Loader2Icon
                          className="left-0 animate-spin"
                          size={20}
                        />
                      ) : (
                        <CircleX className="text-red-500 left-0" size={20} />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-row">
              <Loader2Icon className="mr-2 animate-spin" size={20} />
              <h1 className="font-bold text-xl">Cargando...</h1>
            </div>
          )}
          <Button
            type="submit"
            disabled={working || isButtonDisabled}
            className="mr-7 mt-15 pl-16 pr-16 font-medium rounded-full w-fit justify-self-right
          text-lg bg-[#BEF0BB] hover:bg-[#DDF9CC] text-[#3E3E3E]">
            {" "}
            {working && <Loader2Icon className="mr-2 animate-spin" size={16} />}
            {edit ? (
              <Edit02Icon className="h-4" />
            ) : (
              <Bookmark02Icon className="mr-2 font-light h-4 color:text-gray-500" />
            )}
            {edit ? "Actualizar" : "Guardar"}
          </Button>
        </form>
      </Form>
    </>
  );
}
