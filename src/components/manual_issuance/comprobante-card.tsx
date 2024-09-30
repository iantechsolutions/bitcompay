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
  visualization: boolean;
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
            value: visualizationSwitcher(
              props.visualization,
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
              />,
              props.form.getValues("puntoVenta")
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de emisión",
            value: visualizationSwitcher(
              props.visualization,
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
              />,
              dayjs(props.form.getValues("dateEmision")).format("DD/MM/YYYY") ??
                "no hay fecha seleccionada"
            ),
          }}
        />

        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Alicuota",
            value: visualizationSwitcher(
              props.visualization,
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
              />,
              props.form.getValues("alicuota")
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Tipo de concepto",
            value: visualizationSwitcher(
              props.visualization,
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
              />,
              props.form.getValues("tipoDeConcepto")
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de vencimiento",
            value: visualizationSwitcher(
              props.visualization,
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
              />,
              dayjs(props.form.getValues("dateVencimiento")).format(
                "DD/MM/YYYY"
              ) ?? "no hay fecha seleccionada"
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha inicio de servicio",
            value: visualizationSwitcher(
              props.visualization,
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
              />,
              dayjs(props.form.getValues("dateDesde")).format("DD/MM/YYYY") ??
                "no hay fecha seleccionada"
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha fin de servicio",
            value: visualizationSwitcher(
              props.visualization,
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
              />,
              dayjs(props.form.getValues("dateHasta")).format("DD/MM/YYYY") ??
                "no hay fecha seleccionada"
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
            value: visualizationSwitcher(
              props.visualization,
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
              />,
              props.form.getValues("puntoVenta")
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de emisión",
            value: visualizationSwitcher(
              props.visualization,
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
              />,
              dayjs(props.form.getValues("dateEmision")).format("DD/MM/YYYY") ??
                "no hay fecha seleccionada"
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha de vencimiento",
            value: visualizationSwitcher(
              props.visualization,
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
              />,
              dayjs(props.form.getValues("dateVencimiento")).format(
                "DD/MM/YYYY"
              ) ?? "no hay fecha seleccionada"
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha inicio de servicio",
            value: visualizationSwitcher(
              props.visualization,
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
              />,
              dayjs(props.form.getValues("dateDesde")).format("DD/MM/YYYY") ??
                "no hay fecha seleccionada"
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Fecha fin de servicio",
            value: visualizationSwitcher(
              props.visualization,
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
              />,
              dayjs(props.form.getValues("dateHasta")).format("DD/MM/YYYY") ??
                "no hay fecha seleccionada"
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
              props.visualization,
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
              />,
              dayjs(props.form.getValues("dateEmision")).format("DD/MM/YYYY") ??
                "no hay fecha seleccionada"
            ),
          }}
        />
        <ElementCard
          className="pr-1 pb-0 border-[#bef0bb]"
          element={{
            key: "Facturas emitidas",
            value: visualizationSwitcher(
              props.visualization,
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
              />,
              props.form.getValues("facturasEmitidas").toString() ??
                "no hay facturas emitidas"
            ),
          }}
        />
      </>
    ),
  };
  const comprobanteValueTipo = valueToNameComprobanteMap[props.tipoComprobante];
  return (
    <>
      <div className="border rounded-lg px-6 pt-7 pb-8">
        <p className=" text-lg font-semibold">Datos del Comprobante</p>
        <div className="mt-3 w-full">
          <Form {...props.form}>
            <form
              className={cn(
                comprobanteValueTipo == "Recibo" &&
                  "w-full grid grid-flow-col justify-stretch gap-5",
                comprobanteValueTipo != "Recibo" &&
                  "grid grid-cols-2 gap-4 gap-x-6"
              )}
            >
              <ElementCard
                className="pr-1 pb-0 border-[#bef0bb]"
                element={{
                  key: "Tipo Comprobante",
                  value: visualizationSwitcher(
                    props.visualization,
                    <Select
                      onValueChange={(e) => props.setTipoComprobante(e)}
                      defaultValue={props.tipoComprobante}
                    >
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
                    reverseComprobanteDictionary[Number(props.tipoComprobante)]
                  ),
                }}
              />
              {props.tipoComprobante != "" &&
                Map[comprobanteValueTipo ?? "default"]}
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}
