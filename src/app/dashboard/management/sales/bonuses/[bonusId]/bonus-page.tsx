"use client";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { CalendarIcon, CheckIcon, Loader2 } from "lucide-react";
import { type MouseEventHandler, useState } from "react";
import { toast } from "sonner";
import LayoutContainer from "~/components/layout-container";
import { List, ListTile } from "~/components/list";
import { Title } from "~/components/title";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { asTRPCError } from "~/lib/errors";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";
import { Calendar } from "~/components/ui/calendar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Card } from "~/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { type Bonuses } from "~/server/db/schema";
import { useForm } from "react-hook-form";
import { type Inputs } from "../add-bonus-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { date, datetime } from "drizzle-orm/mysql-core";
dayjs.extend(utc);
dayjs.locale("es");

interface BonusPageProps {
  bonus: Bonuses;
}

export default function BonusPage(props: BonusPageProps) {
  const router = useRouter();
  const initialValues = {
    appliedUser: props.bonus.appliedUser,
    aprovedUser: props.bonus.approverUser,
    validationDate: props.bonus.validationDate,
    amount: props.bonus.amount,
    reason: props.bonus.reason,
    duration: props.bonus.duration,
  };
  const [bonusData, setBonusData] = useState<Inputs | null>(initialValues);
  const form = useForm<Inputs>({ defaultValues: initialValues });
  const { mutateAsync: changeBonus, isLoading } =
    api.bonuses.change.useMutation();

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [fechaValidacion, setFechaValidacion] = useState<Date>(
    props.bonus.validationDate || new Date()
  );

  async function FechasCreate(e: any) {
    setFechaValidacion(e);
    setPopoverOpen(false);
    console.log(e);
  }

  async function handleChange() {
    try {
      await changeBonus({
        id: props.bonus.id,
        appliedUser: bonusData?.appliedUser ?? "",
        approverUser: bonusData?.aprovedUser ?? " ",
        validationDate: fechaValidacion,
        duration: bonusData?.duration ?? " ",
        amount: bonusData?.amount ?? "",
        reason: bonusData?.reason ?? " ",
      });
      console.log(bonusData);
      toast.success("Se ha actualizado la informacion del bono");
      router.refresh();
    } catch (e) {
      const error = asTRPCError(e)!;
      toast.error(error.message);
    }
  }

  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>{props.bonus.reason}</Title>
          <Button disabled={isLoading} onClick={handleChange}>
            {isLoading ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <CheckIcon className="mr-2" />
            )}{" "}
            Aplicar
          </Button>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <h2 className="text-md">Info. de la bonificacion</h2>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Form {...form}>
                    <form onChange={() => setBonusData(form.getValues())}>
                      <FormField
                        name="appliedUser"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuario de aplicacion</FormLabel>
                            <Input
                              {...field}
                              placeholder="ingrese usuario de aplicacion"
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="aprovedUser"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuario aprobado</FormLabel>
                            <Input
                              {...field}
                              placeholder="ingrese usuario aprobado"
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="validationDate"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de validacion</FormLabel>
                            <br />
                            <Popover
                              open={popoverOpen}
                              onOpenChange={setPopoverOpen}>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-[240px] pl-3 text-left font-normal",
                                      !fechaValidacion &&
                                        "text-muted-foreground"
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
                              <PopoverContent
                                className="w-auto p-0"
                                align="start">
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
                        name="duration"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duracion</FormLabel>
                            <Input {...field} placeholder="ingrese duracion" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="amount"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad</FormLabel>
                            <Input {...field} placeholder="ingrese cantidad" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="reason"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Razon</FormLabel>
                            <Input {...field} placeholder="ingrese razon" />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </div>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-none">
            <AccordionTrigger>
              <h2 className="text-md">Eliminar bonificacion</h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex justify-end">
                <DeleteBonus bonusesId={props.bonus.id} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </LayoutContainer>
  );
}

function DeleteBonus(props: { bonusesId: string }) {
  const { mutateAsync: deleteBonus, isLoading } =
    api.bonuses.delete.useMutation();

  const router = useRouter();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    deleteBonus({ bonusesId: props.bonusesId })
      .then(() => {
        toast.success("Se ha eliminado el bono");
        router.push("./");
        router.refresh();
      })
      .catch((e) => {
        const error = asTRPCError(e)!;
        toast.error(error.message);
      });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-[160px]">
          Eliminar Bono
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Estás seguro que querés eliminar el bono?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Eliminar bono permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600 active:bg-red-700"
            onClick={handleDelete}
            disabled={isLoading}>
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
