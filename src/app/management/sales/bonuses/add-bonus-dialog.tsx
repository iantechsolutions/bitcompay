"use client";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { CalendarIcon, Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "~/components/ui/popover";
import { Calendar } from "~/components/ui/calendar";
import { useForm, SubmitHandler } from "react-hook-form";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { asTRPCError } from "~/lib/errors";
export type Inputs = {
  appliedUser: string;
  aprovedUser: string;
  validationDate: Date | null;
  amount: string;
  reason: string;
  duration: string;
};
dayjs.extend(utc);
dayjs.locale("es");
export default function AddBonusDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutateAsync: createBonus, isLoading } =
    api.bonuses.create.useMutation();
  const form = useForm<Inputs>();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [fechaValidacion, setFechaValidacion] = useState<Date>();

  async function FechasCreate(e: any) {
    setFechaValidacion(e);
    setPopoverOpen(false);
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      const amountNumber = parseFloat(data!.amount.replace(",", "."));
      const roundedAmount = amountNumber.toFixed(2);

      console.log(roundedAmount);
      await createBonus({
        appliedUser: data.appliedUser,
        approverUser: data.aprovedUser,
        validationDate: fechaValidacion,
        duration: data.duration,
        amount: roundedAmount,
        reason: data.reason,
      });
      toast.success("Bono creado correctamente");
      router.refresh();
      setOpen(false);
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}className="rounded-full gap-1 px-4 py-5 text-base text-[#3E3E3E] bg-[#BEF0BB] hover:bg-[#DEF5DD]">
       {isLoading ? (
                  <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                ) : (
                  <PlusCircleIcon className="h-5 mr-1 stroke-1" />
                )}  
        Crear bonificación
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear bonificación</DialogTitle>
          </DialogHeader>
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="appliedUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario Aplicado</FormLabel>
                      <Input
                        {...field}
                        placeholder="Ingrese el usuario aplicado"
                      />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aprovedUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuario Aprobador</FormLabel>
                      <Input
                        {...field}
                        placeholder="Ingrese el usuario aprobador"
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="validationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Validación</FormLabel>
                      <br />
                      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !fechaValidacion && "text-muted-foreground"
                              )}>
                              <p>
                                {fechaValidacion ? (
                                  dayjs
                                    .utc(fechaValidacion)
                                    .format("D [de] MMMM [de] YYYY")
                                ) : (
                                  <span>Escoga una fecha</span>
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
                              fechaValidacion
                                ? new Date(fechaValidacion)
                                : undefined
                            }
                            onSelect={(e) => FechasCreate(e)}
                            disabled={(date: Date) =>
                              date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto</FormLabel>
                      <Input {...field} placeholder="0,00" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razón</FormLabel>
                      <Input {...field} placeholder="Ingrese la razón" />
                    </FormItem>
                  )}
                />
                <FormField
                  name="duration"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración</FormLabel>
                      <Input {...field} placeholder="Ingrese la duración" />
                    </FormItem>
                  )}
                />
                <Button type="submit"  className="flex rounded-full w-fit justify-self-center bg-[#BEF0BB] text-[#3E3E3E] hover:bg-[#DEF5DD]"
                disabled={isLoading}>
                {isLoading ? (
                  <Loader2Icon className="h-4 mr-1 animate-spin" size={20} />
                ) : (
                  <PlusCircleIcon className="h-4 mr-1 stroke-1" />
                )}
                  Crear bonificación
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
