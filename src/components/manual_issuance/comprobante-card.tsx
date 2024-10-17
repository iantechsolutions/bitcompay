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
import { cn, reverseComprobanteDictionary } from "~/lib/utils";
import { format, setDefaultOptions } from "date-fns";
import { es } from "date-fns/locale";
import { Form, FormControl, FormField } from "../ui/form";
import { Input } from "../ui/input";
import { valueToNameComprobanteMap } from "~/lib/utils";
import { visualizationSwitcher } from "~/lib/utils";
import dayjs from "dayjs";
import { RouterOutputs } from "~/trpc/shared";
import { ManualGenInputs } from "~/lib/types/app";
import { useState } from "react";
import { ComboboxDemo } from "../ui/combobox";
interface ComprobanteCardProps {
  visualization: boolean;
  form: UseFormReturn<ManualGenInputs>;
  tipoComprobante: string;
  setTipoComprobante: (e: string) => void;
  comprobantes?: RouterOutputs["comprobantes"]["getByEntity"];
  onValueChange?: () => void;
}
export default function ComprobanteCard({
  onValueChange,
  visualization,
  form,
  tipoComprobante,
  setTipoComprobante,
  comprobantes,
}: ComprobanteCardProps) {
  const [concept, setConcept] = useState(true);

  setDefaultOptions({ locale: es });
  const Map: Record<string, React.ReactNode> = {
    default: <></>,
    Factura: (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Punto de venta",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={form.control}
                name="puntoVenta"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
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
                          className="rounded-none ">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />,
              form.getValues("puntoVenta")
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
                name="dateEmision"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                          !field.value && "text-muted-foreground"
                        )}>
                        {field.value && dayjs(field.value).isValid() ? (
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
                        // Ensure the onChange event updates the form state
                        onSelect={(date) => field.onChange(date)}
                        selected={field.value}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />,
              dayjs(form.getValues("dateEmision")).format("DD/MM/YYYY") ??
                "No hay fecha seleccionada"
            ),
          }}
        />

        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Alicuota",
            value: visualizationSwitcher(
              visualization,
              <FormField
                name="alicuota"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
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
                          className="rounded-none ">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />,
              form.getValues("alicuota")
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Tipo de concepto",
            value: visualizationSwitcher(
              visualization,
              <FormField
                name="tipoDeConcepto"
                control={form.control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setConcept(value === "1");
                    }}
                    defaultValue={field.value}>
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
                          className="rounded-none ">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />,
              form.getValues("tipoDeConcepto")
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de vencimiento",
            value: visualizationSwitcher(
              visualization,
              <FormField
                name="dateVencimiento"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                          !field.value && "text-muted-foreground"
                        )}>
                        {field.value && dayjs(field.value).isValid() ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <Calendar01Icon className=" h-4 w-4" />
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
              dayjs(form.getValues("dateVencimiento")).format("DD/MM/YYYY") ??
                "No hay fecha seleccionada"
            ),
          }}
        />
        {concept ? null : (
          <>
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "Fecha inicio de servicio",
                value: visualizationSwitcher(
                  visualization,
                  <FormField
                    name="dateDesde"
                    control={form.control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild={true}>
                          <Button
                            variant={"outline"}
                            //   disabled={concepto == "" || concepto == "1"}
                            className={cn(
                              "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                              !field.value && "text-muted-foreground"
                            )}>
                            {field.value && dayjs(field.value).isValid() ? (
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
                  dayjs(form.getValues("dateDesde")).format("DD/MM/YYYY") ??
                    "No hay fecha seleccionada"
                ),
              }}
            />
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "Fecha fin de servicio",
                value: visualizationSwitcher(
                  visualization,
                  <FormField
                    name="dateHasta"
                    control={form.control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild={true}>
                          <Button
                            variant={"outline"}
                            // disabled={concepto == "" || concepto == "1"}
                            className={cn(
                              "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                              !field.value && "text-muted-foreground"
                            )}>
                            {field.value && dayjs(field.value).isValid() ? (
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
                  dayjs(form.getValues("dateHasta")).format("DD/MM/YYYY") ??
                    "No hay fecha seleccionada"
                ),
              }}
            />
          </>
        )}
      </>
    ),
    "Nota de crédito": (
      <>
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Punto de venta",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={form.control}
                name="puntoVenta"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
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
                          className="rounded-none ">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />,
              form.getValues("puntoVenta")
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
                name="dateEmision"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                          !field.value && "text-muted-foreground"
                        )}>
                        {field.value && dayjs(field.value).isValid() ? (
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
              dayjs(form.getValues("dateEmision")).format("DD/MM/YYYY") ??
                "No hay fecha seleccionada"
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de vencimiento",
            value: visualizationSwitcher(
              visualization,
              <FormField
                name="dateVencimiento"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                          !field.value && "text-muted-foreground"
                        )}>
                        {field.value && dayjs(field.value).isValid() ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <Calendar01Icon className=" h-4 w-4" />
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
              dayjs(form.getValues("dateVencimiento")).format("DD/MM/YYYY") ??
                "No hay fecha seleccionada"
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha inicio de servicio",
            value: visualizationSwitcher(
              visualization,
              <FormField
                name="dateDesde"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        //   disabled={concepto == "" || concepto == "1"}
                        className={cn(
                          "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                          !field.value && "text-muted-foreground"
                        )}>
                        {field.value && dayjs(field.value).isValid() ? (
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
              dayjs(form.getValues("dateDesde")).format("DD/MM/YYYY") ??
                "No hay fecha seleccionada"
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha fin de servicio",
            value: visualizationSwitcher(
              visualization,
              <FormField
                name="dateHasta"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        // disabled={concepto == "" || concepto == "1"}
                        className={cn(
                          "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                          !field.value && "text-muted-foreground"
                        )}>
                        {field.value && dayjs(field.value).isValid() ? (
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
              dayjs(form.getValues("dateHasta")).format("DD/MM/YYYY") ??
                "No hay fecha seleccionada"
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
            value: visualizationSwitcher(
              visualization,
              <FormField
                name="dateEmision"
                control={form.control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                          !field.value && "text-muted-foreground"
                        )}>
                        {field.value && dayjs(field.value).isValid() ? (
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
              dayjs(form.getValues("dateEmision")).format("DD/MM/YYYY") ??
                "No hay fecha seleccionada"
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Facturas emitidas",
            value: visualizationSwitcher(
              visualization,
              <FormField
                control={form.control}
                name="facturasEmitidas.nroComprobante"
                render={({ field }) => (
                  <ComboboxDemo
                    options={
                      comprobantes
                        ?.filter(
                          (comprobante) =>
                            comprobante.tipoComprobante !== "0" &&
                            (comprobante.estado === "Parcial" ||
                              comprobante.estado === "Pendiente")
                        )
                        .slice(0, 10)
                        .map((comprobante) => ({
                          value: comprobante.id.toString(),
                          label:
                            comprobante.nroComprobante.toString() +
                            " - " +
                            comprobante.importe.toString(),
                        })) ?? []
                    }
                    title="Facturas emitidas"
                    placeholder="Seleccionar facturas..."
                    classNameButton="border-none focus:ring-transparent px-0 py-0 h-8 w-full"
                    value={field.value}
                    onSelectionChange={(e) => {
                      for (const comprobante of comprobantes ?? []) {
                        if (comprobante.id.toString() === e) {
                          form.setValue(
                            "facturasEmitidas.importe",
                            comprobante.importe
                          );
                          form.setValue(
                            "facturasEmitidas.iva",
                            comprobante.iva
                          );

                          form.setValue(
                            "facturasEmitidas.nroComprobante",
                            comprobante.nroComprobante.toString()
                          );
                          form.setValue(
                            "facturasEmitidas.tipoComprobante",
                            comprobante.tipoComprobante
                          );
                          form.setValue(
                            "facturasEmitidas.puntoVenta",
                            comprobante.ptoVenta.toString()
                          );
                          if (onValueChange) onValueChange();
                          break;
                        }
                      }
                    }}
                  />
                )}
              />,
              form.getValues("facturasEmitidas").nroComprobante.toString() +
                " - " +
                form.getValues("facturasEmitidas").importe.toString()
            ),
          }}
        />
      </>
    ),
  };
  const comprobanteValueTipo = valueToNameComprobanteMap[tipoComprobante];
  return (
    <>
      <div className="border rounded-lg px-6 pt-7 pb-8">
        <p className=" text-lg font-semibold">Datos del Comprobante</p>
        <div className="mt-3 w-full">
          <Form {...form}>
            <form
              className={cn(
                comprobanteValueTipo == "Recibo" &&
                  "w-full grid grid-flow-col justify-stretch gap-5",
                comprobanteValueTipo != "Recibo" &&
                  "grid grid-cols-2 gap-4 gap-x-6"
              )}>
              <ElementCard
                className="pr-1 pb-0 border-[#bef0bb]"
                element={{
                  key: "Tipo Comprobante",
                  value: visualizationSwitcher(
                    visualization,
                    <Select
                      onValueChange={(e) => setTipoComprobante(e)}
                      defaultValue={tipoComprobante}>
                      <SelectTrigger className="border-none focus:ring-transparent px-0 py-0 h-8">
                        <SelectValue placeholder="Seleccionar comprobante..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">RECIBO</SelectItem>
                        <SelectItem value="1">FACTURA A</SelectItem>
                        <SelectItem value="3">NOTA DE CREDITO A</SelectItem>
                        <SelectItem value="6">FACTURA B</SelectItem>
                        <SelectItem value="8">NOTA DE CREDITO B</SelectItem>
                      </SelectContent>
                    </Select>,
                    reverseComprobanteDictionary[Number(tipoComprobante)]
                  ),
                }}
              />
              {tipoComprobante != "" && Map[comprobanteValueTipo ?? "default"]}
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
