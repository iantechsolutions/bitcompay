"use client";
import { UseFormReturn } from "react-hook-form";
import ElementCard from "~/components/affiliate-page/element-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Calendar01Icon from "../icons/calendar-01-stroke-rounded";
import { Calendar } from "../ui/calendar";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";
import { format, setDefaultOptions } from "date-fns";
import { es } from "date-fns/locale";
import { Form, FormField } from "../ui/form";
import { Input } from "../ui/input";
import { valueToNameComprobanteMap} from "~/lib/utils";
import { useState } from "react";
type ManualGenInputs = {
  puntoVenta: string;
  tipoDeConcepto: string;
  alicuota: string;
  dateEmision: Date;
  dateVencimiento: Date;
  dateDesde: Date;
  dateHasta: Date;
  facturasEmitidas: Number;
};
interface ComprobanteCardProps {
  form: UseFormReturn<ManualGenInputs>;
  tipoComprobante: string;
  setTipoComprobante: (e: string) => void;
}
export default function ComprobanteCard(props: ComprobanteCardProps) {
  setDefaultOptions({ locale: es });
  const Map: Record<string, React.ReactNode> = {
    default: <></>,
    Factura: (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Punto de venta",
            value: (
              <FormField
                control={props.form.control}
                name="puntoVenta"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="border-none focus:ring-transparent px-0 py-0 h-8">
                      <SelectValue placeholder="Seleccionar PV..." />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { value: "1", label: "1" },
                        { value: "2", label: "2" },
                      ].map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="rounded-none "
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de emisión",
            value: (
              <FormField
                name="dateEmision"
                control={props.form.control}
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
                      <Calendar mode="single" initialFocus={true} />
                    </PopoverContent>
                  </Popover>
                )}
              />
            ),
          }}
        />

        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Alicuota",
            value: (
              <FormField
                name="alicuota"
                control={props.form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="border-none focus:ring-transparent px-0 py-0 h-8 ">
                      <SelectValue placeholder="Seleccionar alicuota" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { value: "3", label: "0%" },
                        { value: "4", label: "10.5%" },
                        { value: "5", label: "21%" },
                        { value: "6", label: "27%" },
                        { value: "8", label: "5%" },
                        { value: "9", label: "2.5%" },
                      ].map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="rounded-none "
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Tipo de concepto",
            value: (
              <FormField
                name="tipoDeConcepto"
                control={props.form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="border-none focus:ring-transparent px-0 py-0 h-8">
                      <SelectValue placeholder="Seleccionar concepto" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { value: "1", label: "Productos" },
                        { value: "2", label: "Servicios" },
                        { value: "3", label: "Productos y Servicios" },
                      ].map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="rounded-none "
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de vencimiento",
            value: (
              <FormField
                name="dateVencimiento"
                control={props.form.control}
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
                        <Calendar01Icon className=" h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" initialFocus={true} />
                    </PopoverContent>
                  </Popover>
                )}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha inicio de servicio",
            value: (
              <FormField
                name="dateDesde"
                control={props.form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        //   disabled={concepto == "" || concepto == "1"}
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
                      <Calendar mode="single" initialFocus={true} />
                    </PopoverContent>
                  </Popover>
                )}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha fin de servicio",
            value: (
              <FormField
                name="dateHasta"
                control={props.form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        // disabled={concepto == "" || concepto == "1"}
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
                      <Calendar mode="single" initialFocus={true} />
                    </PopoverContent>
                  </Popover>
                )}
              />
            ),
          }}
        />
      </>
    ),
    "Nota de crédito": (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Punto de venta",
            value: (
              <FormField
                control={props.form.control}
                name="puntoVenta"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="border-none focus:ring-transparent px-0 py-0 h-8">
                      <SelectValue placeholder="Seleccionar PV..." />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { value: "1", label: "1" },
                        { value: "2", label: "2" },
                      ].map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="rounded-none "
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de emisión",
            value: (
              <FormField
                name="dateEmision"
                control={props.form.control}
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
                      <Calendar mode="single" initialFocus={true} />
                    </PopoverContent>
                  </Popover>
                )}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de vencimiento",
            value: (
              <FormField
                name="dateVencimiento"
                control={props.form.control}
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
                        <Calendar01Icon className=" h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" initialFocus={true} />
                    </PopoverContent>
                  </Popover>
                )}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha inicio de servicio",
            value: (
              <FormField
                name="dateDesde"
                control={props.form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        //   disabled={concepto == "" || concepto == "1"}
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
                      <Calendar mode="single" initialFocus={true} />
                    </PopoverContent>
                  </Popover>
                )}
              />
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha fin de servicio",
            value: (
              <FormField
                name="dateHasta"
                control={props.form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        // disabled={concepto == "" || concepto == "1"}
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
                      <Calendar mode="single" initialFocus={true} />
                    </PopoverContent>
                  </Popover>
                )}
              />
            ),
          }}
        />
      </>
    ),
    Recibo: (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de emisión",
            value: (
              <FormField
                name="dateEmision"
                control={props.form.control}
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
                      <Calendar mode="single" initialFocus={true} />
                    </PopoverContent>
                  </Popover>
                )}
              />
            ),
          }}
        />
        <ElementCard className="pr-1 pb-0 border-[#bef0bb]" element={{key: "Facturas emitidas", value: (
            <FormField
                control={props.form.control}
                name="facturasEmitidas"
                render={({ field }) => (
                    <Input
                        type="number"
                        className="w-full border-none focus:ring-transparent"
                        placeholder="Facturas emitidas"
                        {...field}
                        value={field.value as number}
                    />
                )}
            />
        )}}/>
      </>
    ),
  };
  const comprobanteValueTipo= valueToNameComprobanteMap[props.tipoComprobante]
  return <>
    <div className="border rounded-lg px-6 pt-7 pb-8">
            <p className=" text-lg font-semibold">Datos del Comprobante</p>
            <div className="mt-3 w-full">
              <Form {...props.form}>
                <form className={cn(comprobanteValueTipo=="Recibo" && "w-full flex justify-stretch gap-3", 
                    comprobanteValueTipo!="Recibo" && "grid grid-cols-2 gap-4 gap-x-1"
                )}>
                  <ElementCard
                    className="pr-1 pb-0 border-[#bef0bb]"
                    element={{
                      key: "Tipo Comprobante",
                      value: (
                        <Select onValueChange={(e) => props.setTipoComprobante(e)} defaultValue={props.tipoComprobante}>
                          <SelectTrigger className="border-none focus:ring-transparent px-0 py-0 h-8">
                            <SelectValue placeholder="Seleccionar comprobante..." />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { value: "0", label: "RECIBO" },
                              { value: "1", label: "FACTURA A" },
                              { value: "3", label: "NOTA DE CREDITO A" },
                              { value: "6", label: "FACTURA B" },
                              { value: "8", label: "NOTA DE CREDITO B" },
                            ].map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="rounded-none "
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ),
                    }}
                  />
                  {props.tipoComprobante!= "" && Map[comprobanteValueTipo ?? "default"]}
                </form>
              </Form>
            </div>
          </div>
  
  
  </>;
}
