"use client";
import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { useCompanyData } from "~/app/dashboard/[companyId]/company-provider";
import { type RouterOutputs } from "~/trpc/shared";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  AlertDialogHeader,
  AlertDialogFooter,
} from "~/components/ui/alert-dialog";
import { Card } from "~/components/ui/card";
import LayoutContainer from "~/components/layout-container";
import { plans } from "~/server/db/schema";
import { Title } from "~/components/title";
dayjs.extend(utc);
dayjs.locale("es");

type Inputs = {
  validy_date: string;
  plan_code: string;
  description: string;
};

export default function PlanPage(props: {
  plan: RouterOutputs["plans"]["get"];
}) {
  const router = useRouter();
  const company = useCompanyData();
  const initialValues: Inputs = {
    validy_date: props.plan!.validy_date.toString(),
    plan_code: props.plan!.plan_code!,
    description: props.plan!.description!,
  };

  const form = useForm<Inputs>({
    resolver: zodResolver(PlanSchema),
    defaultValues: { ...initialValues },
  });

  const { errors } = form.formState;
  const { watch } = form;

  const { mutateAsync: changePlan } = api.plans.change.useMutation();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const parsedData = PlanSchema.parse(data);
      await changePlan({ ...parsedData, planId: company.id });
      router.push(`/dashboard/${company.id}/administration/units`);
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  };

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex-col justify-between">
          <Title>{props.plan!.description}</Title>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Editar Plan</AccordionTrigger>
              <AccordionContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex-col items-center justify-center gap-2 space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="validy_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="validy_date">
                            Fecha de vigencia
                          </FormLabel>
                          <br />
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={
                                  field.value
                                    ? new Date(field.value)
                                    : undefined
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
                          <FormLabel htmlFor="plan_code">
                            Código de plan
                          </FormLabel>
                          <FormControl>
                            <Input id="plan_code" type="text" {...field} />
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
                          <FormLabel htmlFor="description">
                            Descripción
                          </FormLabel>
                          <FormControl>
                            <Input id="description" type="text" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="pb-5">
                      <Button type="submit">Guardar cambios</Button>
                    </div>
                  </form>
                </Form>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Eliminar Plan</AccordionTrigger>
              <AccordionContent>
                <Card className="p-5">
                  <div className="flex justify-end">
                    <DeletePlan planId={props.plan!.id} />
                  </div>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </LayoutContainer>
  );
}

export function DeletePlan(props: { planId: string }) {
  const company = useCompanyData();
  const { mutateAsync: deletePlan, isLoading } = api.plans.delete.useMutation();
  const router = useRouter();
  const handleDelete = async () => {
    try {
      await deletePlan({ planId: props.planId });
      toast.success("Plan eliminado");
      router.push(`/dashboard/${company.id}/administration/plans`);
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-[160px]">
          Eliminar Proveedor
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar este proveedor?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar Plan permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600 active:bg-red-700"
            onClick={handleDelete}
            disabled={isLoading}
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
