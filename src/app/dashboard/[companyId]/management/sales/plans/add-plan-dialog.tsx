"use client";
import { CircleX, PlusCircle, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "~//components/ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
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
import { cn } from "~/lib/utils";
import { PlanSchema } from "~/server/forms/plans-schema";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Calendar as CalendarIcon } from "lucide-react";
import { useCompanyData } from "../../../company-provider";

import { Checkbox } from "~/components/ui/checkbox";
import { useFieldArray } from "react-hook-form";

dayjs.extend(utc);
dayjs.locale("es");

type ConditionalPrice = {
  condition: string;
  age_from: string;
  age_to?: string;
  price: string;
  isConditional: boolean;
};

type Inputs = {
  expiration_date: string;
  plan_code: string;
  description: string;
  conditional_prices: ConditionalPrice[];
};

export default function AddPlanDialog() {
  const router = useRouter();
  const company = useCompanyData();
  const [open, setOpen] = useState(false);
  const initValues: Inputs = {
    expiration_date: "",
    plan_code: "",
    description: "",
    conditional_prices: [],
  };
  const [initialValues, setInitialValues] = useState<Inputs>(initValues);

  const form = useForm<Inputs>({
    // resolver: zodResolver(PlanSchema),
    defaultValues: { ...initialValues },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "conditional_prices",
  });

  const { mutateAsync: createPlan } = api.plans.create.useMutation();
  const { mutateAsync: createPricePerAge } =
    api.pricePerAge.create.useMutation();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const parsedData = PlanSchema.parse(data);
      const plan = await createPlan(parsedData);
      data.conditional_prices.map((item) => {
        if (item.isConditional) {
          createPricePerAge({
            condition: item.condition,
            amount: parseFloat(item.price),
            plan_id: "1",
            isAmountByAge: false,
          });
        } else {
          for (
            let i = parseInt(item.age_from);
            i <= parseInt(item.age_to ?? "0");
            i++
          ) {
            createPricePerAge({
              age: i,
              amount: parseFloat(item.price),
              plan_id: "1",
              isAmountByAge: true,
            });
          }
        }
      });
      if (setOpen) {
        setOpen(false);
      }
      // router.push(`/dashboard/company/${company.id}/administration/units`);
      // router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" size={20} />
        Agregar Plan
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>Agregar nuevo plan</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex-col items-center justify-center gap-2 space-y-8"
            >
              <FormField
                control={form.control}
                name="expiration_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col ">
                    <FormLabel htmlFor="expiration_date">
                      Fecha de vigencia
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] border-green-300 pl-3 text-left font-normal focus-visible:ring-green-400",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <p>
                              {field.value ? (
                                dayjs
                                  .utc(field.value)
                                  .format("D [de] MMMM [de] YYYY")
                              ) : (
                                <span>Seleccione una fecha</span>
                              )}
                            </p>
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={field.onChange}
                          disabled={(date: Date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plan_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="plan_code">Código de plan</FormLabel>
                    <FormControl>
                      <Input
                        className="border-green-300 focus-visible:ring-green-400"
                        id="plan_code"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="description">Descripción</FormLabel>
                    <FormControl>
                      <Input
                        className="border-green-300 focus-visible:ring-green-400"
                        id="description"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Precios Condicionales</FormLabel>
                <br />
                {fields.map((item, index) => (
                  <div key={item.id} className="flex space-x-4 items-center">
                    <div className="w-[300px]">
                      <FormField
                        control={form.control}
                        name={`conditional_prices.${index}.isConditional`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor={`conditional_prices.${index}.isConditional`}
                            >
                              ¿Rango de edad?
                            </FormLabel>
                            <br />
                            <FormControl>
                              <Checkbox
                                className="border-green-300 focus-visible:ring-green-400"
                                id={`conditional_prices.${index}.isConditional`}
                                checked={
                                  !initialValues.conditional_prices[index]
                                    ?.isConditional
                                }
                                onCheckedChange={(e) => {
                                  const updatedValues = [
                                    ...initialValues.conditional_prices,
                                  ];
                                  updatedValues[index]!.isConditional = !initialValues.conditional_prices[index]
                                  ?.isConditional
                                  setInitialValues({
                                    ...initialValues,
                                    conditional_prices: updatedValues,
                                  });
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {initialValues?.conditional_prices[index]
                      ?.isConditional && (
                      <FormField
                        control={form.control}
                        name={`conditional_prices.${index}.condition`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel
                              htmlFor={`conditional_prices.${index}.condition`}
                            >
                              Condición
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="border-green-300 focus-visible:ring-green-400"
                                id={`conditional_prices.${index}.condition`}
                                type="text"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {!initialValues?.conditional_prices[index]
                      ?.isConditional && (
                      <>
                        <FormField
                          control={form.control}
                          name={`conditional_prices.${index}.age_from`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                htmlFor={`conditional_prices.${index}.age_from`}
                              >
                                Edad Desde
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="border-green-300 focus-visible:ring-green-400"
                                  id={`conditional_prices.${index}.age_from`}
                                  type="text"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`conditional_prices.${index}.age_to`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel
                                htmlFor={`conditional_prices.${index}.age_to`}
                              >
                                Edad Hasta
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="border-green-300 focus-visible:ring-green-400"
                                  id={`conditional_prices.${index}.age_to`}
                                  type="text"
                                  {...field}
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
                      name={`conditional_prices.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel
                            htmlFor={`conditional_prices.${index}.price`}
                          >
                            Precio
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="border-green-300 focus-visible:ring-green-400"
                              id={`conditional_prices.${index}.price`}
                              type="text"
                              {...field}
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
                      <CircleX className="text-red-500" size={20} />
                    </Button>
                  </div>
                ))}
                <Button
                  className="mt-4"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    append({
                      condition: "",
                      age_from: "",
                      age_to: "",
                      price: "",
                      isConditional: false,
                    });
                    initialValues.conditional_prices.push({
                      condition: "",
                      age_from: "",
                      age_to: "",
                      price: "",
                      isConditional: false,
                    });
                  }}
                >
                  <PlusCircleIcon className="mr-2" size={20} />
                  Agregar Condición
                </Button>
              </div>
              <p className=" text-sm">
                *Los rangos de edades incluyen el numero escrito
              </p>
              <Button type="submit">
                <PlusCircle></PlusCircle>Agregar Plan
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
