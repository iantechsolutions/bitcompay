import { useForm } from "react-hook-form";
import { Form, FormField } from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { useState } from "react";
import ElementCard from "../affiliate-page/element-card";
import { cn, visualizationSwitcher } from "~/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { format } from "date-fns";
import Calendar01Icon from "../icons/calendar-01-stroke-rounded";
import { Calendar } from "../ui/calendar";
import dayjs from "dayjs";
type PaymentMethodsProps = {
  nroCheque: string;
  banco: string;
  emisionDate: Date;
  paymentDate: Date;
  bandera: string;
  cardType: string;
  entity: string;
  transferDate: Date;
};

interface pageProps {
  visualization: boolean;
  paymentMethod: string;
  setPaymentMethod: (paymentMethod: string) => void;
}
export default function PaymentMethods({
  visualization,
  paymentMethod,
  setPaymentMethod,
}: pageProps) {
  const paymentMethodsForm = useForm<PaymentMethodsProps>({});
  const paymentMethodsMap: Record<string, React.ReactNode> = {
    default: <></>,
    efectivo: <></>,
    Cheque: (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Nº Cheque",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="nroCheque"
                render={({ field }) => <Input type="number" {...field} />}
              />,
              paymentMethodsForm.getValues("nroCheque")
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Banco",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="banco"
                render={({ field }) => <Input {...field} />}
              />,
              paymentMethodsForm.getValues("banco")
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de pago",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="paymentDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <Calendar01Icon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        initialFocus={true}
                        onSelect={(date) => field.onChange(date)}
                        selected={field.value}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />,
              dayjs(paymentMethodsForm.getValues("paymentDate")).format(
                "DD/MM/YYYY"
              ) ?? "No hay fecha seleccionada"
            ),
          }}
        />
      </>
    ),

    "Cheque pago diferido": (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Nº Cheque",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="nroCheque"
                render={({ field }) => <Input type="number" {...field} />}
              />,
              paymentMethodsForm.getValues("nroCheque")
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Banco",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="banco"
                render={({ field }) => <Input {...field} />}
              />,
              paymentMethodsForm.getValues("banco")
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de emisión",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="emisionDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <Calendar01Icon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        initialFocus={true}
                        onSelect={(date) => field.onChange(date)}
                        selected={field.value}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />,
              dayjs(paymentMethodsForm.getValues("emisionDate")).format(
                "DD/MM/YYYY"
              ) ?? "No hay fecha seleccionada"
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de pago",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="paymentDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <Calendar01Icon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        initialFocus={true}
                        onSelect={(date) => field.onChange(date)}
                        selected={field.value}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />,
              dayjs(paymentMethodsForm.getValues("paymentDate")).format(
                "DD/MM/YYYY"
              ) ?? "No hay fecha seleccionada"
            ),
          }}
        />
      </>
    ),
    "E-Cheque": (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Banco",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="banco"
                render={({ field }) => <Input {...field} />}
              />,
              paymentMethodsForm.getValues("banco")
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de pago",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="paymentDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <Calendar01Icon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        initialFocus={true}
                        onSelect={(date) => field.onChange(date)}
                        selected={field.value}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />,
              dayjs(paymentMethodsForm.getValues("paymentDate")).format(
                "DD/MM/YYYY"
              ) ?? "No hay fecha seleccionada"
            ),
          }}
        />
      </>
    ),
    "E-CPD": (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Banco",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="banco"
                render={({ field }) => <Input {...field} />}
              />,
              paymentMethodsForm.getValues("banco")
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de emisión",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="emisionDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <Calendar01Icon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        initialFocus={true}
                        onSelect={(date) => field.onChange(date)}
                        selected={field.value}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />,
              dayjs(paymentMethodsForm.getValues("emisionDate")).format(
                "DD/MM/YYYY"
              ) ?? "No hay fecha seleccionada"
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de pago",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="paymentDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <Calendar01Icon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        initialFocus={true}
                        onSelect={(date) => field.onChange(date)}
                        selected={field.value}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />,
              dayjs(paymentMethodsForm.getValues("paymentDate")).format(
                "DD/MM/YYYY"
              ) ?? "No hay fecha seleccionada"
            ),
          }}
        />
      </>
    ),
    Tarjeta: (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "bandera",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="bandera"
                render={({ field }) => <Input {...field} />}
              />,
              paymentMethodsForm.getValues("bandera")
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Tipo de tarjeta",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="cardType"
                render={({ field }) => <Input {...field} />}
              />,
              paymentMethodsForm.getValues("cardType")
            ),
          }}
        />
      </>
    ),
    Transferencia: (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Entidad",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="entity"
                render={({ field }) => <Input {...field} />}
              />,
              paymentMethodsForm.getValues("entity")
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de transferencia",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={paymentMethodsForm.control}
                name="transferDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <Calendar01Icon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        initialFocus={true}
                        onSelect={(date) => field.onChange(date)}
                        selected={field.value}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />,
              dayjs(paymentMethodsForm.getValues("transferDate")).format(
                "DD/MM/YYYY"
              )
            ),
          }}
        />
      </>
    ),
  };
  return (
    <div className="w-full">
      <Form {...paymentMethodsForm}>
        <form
          className={cn(
            (paymentMethod == "efectivo" || paymentMethod == "default") &&
              "grid grid-cols-4",
            paymentMethod != "efectivo" &&
              paymentMethod &&
              "w-full grid grid-flow-col gap-5 justify-stretch items-center"
          )}
        >
          <ElementCard
            className={cn("pr-1 pb-0 border-[#bef0bb]")}
            element={{
              key: "Medio de Pago",
              value: visualizationSwitcher(
                visualization,
                <Select onValueChange={(e) => setPaymentMethod(e)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar medio de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">Efectivo</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Cheque pago diferido">
                      Cheque pago diferido
                    </SelectItem>
                    <SelectItem value="E-Cheque"> E-Cheque</SelectItem>
                    <SelectItem value="E-CPD">E-CPD</SelectItem>
                    <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="Transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>,
                paymentMethod
              ),
            }}
          />
          {paymentMethodsMap[paymentMethod]}
        </form>
      </Form>
    </div>
  );
}
