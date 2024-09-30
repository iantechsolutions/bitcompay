import ElementCard from "../affiliate-page/element-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn, valueToNameComprobanteMap } from "~/lib/utils";
import GeneralCard from "./general-card";
import { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import CancelCircleIcon from "../icons/cancel-circle-stroke-rounded";
import AddCircleIcon from "../icons/add-circle-stroke-rounded";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Form, FormField } from "../ui/form";
import { RouterOutputs } from "~/trpc/shared";
import PaymentMethods from "./payment-methods";
import { visualizationSwitcher } from "~/lib/utils";
import dayjs from "dayjs";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import Calendar01Icon from "../icons/calendar-01-stroke-rounded";
import { format } from "date-fns";
import { useEffect, useState } from "react";
type ConceptsForm = {
  concepts: {
    concepto: string;
    importe: number;
    iva: number;
    total: number;
  }[];
};
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
type AsociatedFCForm = {
  comprobantes: {
    tipoComprobante: string;
    puntoVenta: string;
    nroComprobante: string;
    dateEmision: Date;
  }[];
};
type otherConceptsForm = {
  otherConcepts: {
    description: string;
    importe: number;
  }[];
};
type AdditionalInfoProps = {
  visualization: boolean;
  tipoComprobante: string;
  conceptsForm: UseFormReturn<ConceptsForm>;
  form: UseFormReturn<ManualGenInputs>;
  asociatedFCForm: UseFormReturn<AsociatedFCForm>;
  otherConceptsForm: UseFormReturn<otherConceptsForm>;
  grupoFamiliar?: RouterOutputs["family_groups"]["list"][number];
};
export default function AdditionalInfoCard({
  conceptsForm,
  asociatedFCForm,
  form,
  tipoComprobante,
  otherConceptsForm,
  visualization,
}: AdditionalInfoProps) {
  const { fields, remove, append } = useFieldArray({
    control: conceptsForm.control,
    name: "concepts",
  });
  const {
    fields: asocFields,
    remove: asocRemove,
    append: asocAppend,
  } = useFieldArray({
    control: asociatedFCForm.control,
    name: "comprobantes",
  });

  const {
    fields: otherConceptsFields,
    remove: otherConceptsRemove,
    append: otherConceptsAppend,
  } = useFieldArray({
    control: otherConceptsForm.control,
    name: "otherConcepts",
  });
  const [paymentMethod, setPaymentMethod] = useState(() => {
    // Recuperar el valor desde localStorage al montar el componente
    const savedPaymentMethod = localStorage.getItem("paymentMethod");
    return savedPaymentMethod
      ? JSON.parse(savedPaymentMethod)
      : "defaultMethod"; // Reemplaza 'defaultMethod' con tu valor por defecto
  });

  useEffect(() => {
    // Guardar el valor en localStorage cuando paymentMethod cambie
    localStorage.setItem("paymentMethod", JSON.stringify(paymentMethod));
  }, [paymentMethod]);
  const AdditionalInfoMap: Record<string, React.ReactNode> = {
    default: <></>,
    Factura: (
      <GeneralCard title="Conceptos" containerClassName="flex flex-col gap-5">
        {fields.length === 0 && !visualization && (
          <div className="flex justify-between px-2">
            <p> no se agregaran conceptos</p>
            <Button
              onClick={() =>
                append({ concepto: "", importe: 0, iva: 0, total: 0 })
              }
            >
              Agregar concepto
            </Button>
          </div>
        )}
        {fields.map((fieldElement, index) => (
          <div
            key={fieldElement.id}
            className="w-full grid grid-flow-col gap-5 justify-stretch items-center"
          >
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "CONCEPTO",
                value: visualizationSwitcher(
                  visualization,
                  <FormField
                    control={conceptsForm.control}
                    name={`concepts.${index}.concepto`}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="ingrese un concepto"
                      />
                    )}
                  />,
                  fieldElement.concepto
                ),
              }}
            />
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "IMPORTE",
                value: visualizationSwitcher(
                  visualization,
                  <FormField
                    control={conceptsForm.control}
                    name={`concepts.${index}.importe`}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        value={field.value ?? 0}
                      />
                    )}
                  />,
                  fieldElement.importe
                ),
              }}
            />
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "IVA",
                value: visualizationSwitcher(
                  visualization,
                  <FormField
                    control={conceptsForm.control}
                    name={`concepts.${index}.iva`}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        value={field.value ?? 0}
                      />
                    )}
                  />,
                  fieldElement.iva
                ),
              }}
            />
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "TOTAL",
                value: visualizationSwitcher(
                  visualization,
                  <FormField
                    control={conceptsForm.control}
                    name={`concepts.${index}.total`}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        value={field.value ?? 0}
                      />
                    )}
                  />,
                  fieldElement.total
                ),
              }}
            />
            {visualization ? null : (
              <div className="w-24 flex gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="bg-transparent hover:bg-transparent border-none shadow-none"
                  onClick={() =>
                    append({ concepto: "", importe: 0, iva: 0, total: 0 })
                  }
                >
                  <AddCircleIcon className="text-[#8bd087]" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  className="bg-transparent hover:bg-transparent border-none shadow-none"
                  onClick={() => remove(index)}
                >
                  <CancelCircleIcon className="text-[#ed4444]" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </GeneralCard>
    ),
    "Nota de crédito": (
      <GeneralCard title="Comprobantes Asociados">
        {asocFields.length === 0 && (
          <div className="flex justify-between px-2">
            <p> no se agregaran comprobantes</p>
            <Button
              onClick={() =>
                asocAppend({
                  tipoComprobante: "",
                  puntoVenta: "",
                  nroComprobante: "",
                  dateEmision: new Date(),
                })
              }
            >
              Agregar comprobante
            </Button>
          </div>
        )}
        {asocFields.map((fieldElement, index) => (
          <div className="w-full grid grid-flow-col gap-5 justify-stretch items-center">
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "COMPROBANTE ASOCIADO",
                value: visualizationSwitcher(
                  visualization,
                  <FormField
                    control={asociatedFCForm.control}
                    name={`comprobantes.${index}.tipoComprobante`}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="border-none focus:ring-transparent px-0 py-0 h-8">
                          <SelectValue placeholder="Seleccionar tipo comprobante..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectContent>
                            <SelectItem value="0">RECIBO</SelectItem>
                            <SelectItem value="1">FACTURA A</SelectItem>
                            <SelectItem value="3">NOTA DE CREDITO A</SelectItem>
                            <SelectItem value="6">FACTURA B</SelectItem>
                            <SelectItem value="8">NOTA DE CREDITO B</SelectItem>
                          </SelectContent>
                        </SelectContent>
                      </Select>
                    )}
                  />,
                  fieldElement.tipoComprobante
                ),
              }}
            />
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "PTO. VTA.",
                value: visualizationSwitcher(
                  visualization,
                  <FormField
                    control={asociatedFCForm.control}
                    name={`comprobantes.${index}.puntoVenta`}
                    render={({ field }) => <Input type="number" {...field} />}
                  />,
                  fieldElement.puntoVenta
                ),
              }}
            />
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "COMPROBANTE",
                value: visualizationSwitcher(
                  visualization,
                  <FormField
                    control={asociatedFCForm.control}
                    name={`comprobantes.${index}.nroComprobante`}
                    render={({ field }) => <Input type="number" {...field} />}
                  />,
                  fieldElement.nroComprobante
                ),
              }}
            />

            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "FECHA DE EMISION",
                value: visualizationSwitcher(
                  visualization,
                  <FormField
                    control={asociatedFCForm.control}
                    name={`comprobantes.${index}.dateEmision`}
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
                  dayjs(fieldElement.dateEmision).format("DD/MM/YYYY")
                ),
              }}
            />
            {visualization ? null : (
              <div className="w-20 flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  className="bg-transparent hover:bg-transparent border-none shadow-none"
                  onClick={() => asocRemove(index)}
                >
                  <CancelCircleIcon className="text-[#ed4444]" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="bg-transparent hover:bg-transparent border-none shadow-none"
                  onClick={() =>
                    asocAppend({
                      tipoComprobante: "",
                      puntoVenta: "",
                      nroComprobante: "",
                      dateEmision: new Date(),
                    })
                  }
                >
                  <AddCircleIcon className="text-[#8bd087]" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </GeneralCard>
    ),
    Recibo: (
      <>
        <GeneralCard title="Medios de Pago">
          <PaymentMethods
            visualization={visualization}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        </GeneralCard>
        <GeneralCard title="Otros conceptos" containerClassName="">
          {otherConceptsFields.length === 0 && !visualization && (
            <div className="flex justify-between px-2">
              <p> no se agregaran conceptos</p>
              <Button
                onClick={() =>
                  otherConceptsAppend({ description: "", importe: 0 })
                }
              >
                Agregar concepto
              </Button>
            </div>
          )}
          {otherConceptsFields.map((fieldElement, index) => (
            <div
              key={fieldElement.id}
              className="w-full grid grid-flow-col gap-5 justify-stretch items-center"
            >
              <ElementCard
                element={{
                  key: "DESCRIPCIÓN",
                  value: visualizationSwitcher(
                    visualization,
                    <FormField
                      name={`otherConcepts.${index}.description`}
                      control={otherConceptsForm.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="ingrese una descripción"
                        />
                      )}
                    />,
                    fieldElement.description
                  ),
                }}
                className=" grow pr-1 pb-0 border-[#bef0bb]"
              />
              <ElementCard
                element={{
                  key: "Importe",
                  value: visualizationSwitcher(
                    visualization,
                    <FormField
                      name={`otherConcepts.${index}.importe`}
                      control={otherConceptsForm.control}
                      render={({ field }) => <Input {...field} type="number" />}
                    />,
                    fieldElement.importe
                  ),
                }}
                className="pr-1 pb-0 border-[#bef0bb]"
              />
              {visualization ? null : (
                <div className="w-24 flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-transparent hover:bg-transparent border-none shadow-none"
                    onClick={() =>
                      otherConceptsAppend({ description: "", importe: 0 })
                    }
                  >
                    <AddCircleIcon className="text-[#8bd087]" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-transparent hover:bg-transparent border-none shadow-none"
                    onClick={() => otherConceptsRemove(index)}
                  >
                    <CancelCircleIcon className="text-[#ed4444]" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </GeneralCard>
      </>
    ),
  };
  const comprobanteValueTipo = valueToNameComprobanteMap[tipoComprobante];
  return <>{AdditionalInfoMap[comprobanteValueTipo ?? "default"]}</>;
}
