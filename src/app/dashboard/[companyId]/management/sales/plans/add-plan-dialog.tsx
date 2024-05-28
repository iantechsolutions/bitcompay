"use client";
import { PlusCircle, PlusCircleIcon } from "lucide-react";
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
dayjs.extend(utc);
dayjs.locale("es");

type Inputs = {
    expiration_date: string
    plan_code: string
    description: string
    age: string
    price: string
}

export default function AddPlanDialog() {
    const router = useRouter()
    const company = useCompanyData()
    const [open, setOpen] = useState(false)
    const initialValues: Inputs = {
        expiration_date: '',
        plan_code: '',
        description: '',
        age: '',
        price: '',
    }

    const form = useForm<Inputs>({
        resolver: zodResolver(PlanSchema),
        defaultValues: { ...initialValues },
    })

    const { mutateAsync: createPlan } = api.plans.create.useMutation()

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        const parsedData = PlanSchema.parse(data)
        await createPlan(parsedData)
        if (setOpen) {
            setOpen(false)
        }
        router.push(`/dashboard/company/${company.id}/administration/units`)
        router.refresh()
    }
  

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" size={20} />
        Agregar Plan
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
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
                      Fecha de vencimiento
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] border-green-300 pl-3 text-left font-normal focus-visible:ring-green-400",
                              !field.value && "text-muted-foreground",
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
              <Button type="submit">
                <PlusCircle></PlusCircle>Agregar Plan
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
