"use client";
import ElementCard from "../affiliate-page/element-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn, ivaDictionary, valueToNameComprobanteMap } from "~/lib/utils";
import GeneralCard from "./general-card";
import { useFormContext, UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import CancelCircleIcon from "../icons/cancel-circle-stroke-rounded";
import AddCircleIcon from "../icons/add-circle-stroke-rounded";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { RouterOutputs } from "~/trpc/shared";
import PaymentMethods from "./payment-methods";
import { visualizationSwitcher } from "~/lib/utils";
import dayjs from "dayjs";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import Calendar01Icon from "../icons/calendar-01-stroke-rounded";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Comprobante } from "~/server/db/schema";
import {
  AsociatedFCForm,
  ConceptsForm,
  ManualGenInputs,
  otherConceptsForm,
} from "~/lib/types/app";
import { Label } from "../ui/label";

type AdditionalInfoProps = {
  onValueChange?: () => void;
  fcSeleccionada: Comprobante[];
  setFcSeleccionada: (comprobante: Comprobante[]) => void;
  visualization: boolean;
  tipoComprobante: string;
  conceptsForm: UseFormReturn<ConceptsForm>;
  form: UseFormReturn<ManualGenInputs>;
  asociatedFCForm: UseFormReturn<AsociatedFCForm>;
  otherConceptsForm: UseFormReturn<otherConceptsForm>;
  grupoFamiliarId?: string;
  comprobantes?: RouterOutputs["comprobantes"]["getByEntity"];
  possibleComprobanteTipo: string;
};
export default function AdditionalInfoCard({
  onValueChange,
  fcSeleccionada,
  setFcSeleccionada,
  conceptsForm,
  asociatedFCForm,
  form,
  tipoComprobante,
  otherConceptsForm,
  visualization,
  grupoFamiliarId,
  possibleComprobanteTipo,
  comprobantes,
}: AdditionalInfoProps) {
  const IVA_TASA = parseFloat(
    ivaDictionary[Number(form.watch("alicuota"))] ?? "0"
  );
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

  const [currentCompType, setCurrentCompType] = useState("");
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
            <p>No se agregarán conceptos</p>
            <Button
              onClick={() =>
                append({
                  concepto: "",
                  importe: 0,
                  iva: IVA_TASA, // Para mostrar como porcentaje
                  total: 0,
                })
              }>
              Agregar concepto
            </Button>
          </div>
        )}
        {fields.map((fieldElement, index) => (
          <div
            key={fieldElement.id}
            className="w-full grid grid-flow-col gap-5 justify-stretch items-center">
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
                        placeholder="Ingrese un concepto"
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
                        onChange={(e) => {
                          const importe = parseFloat(e.target.value) || 0; // Manejo de valores no numéricos
                          field.onChange(importe);

                          const ivaCalcular = isNaN(IVA_TASA) ? 0 : IVA_TASA;
                          // console.log("IVA_TASA",IVA_TASA);
                          // if(isNaN(IVA_TASA)){
                          //   IVA_TASA = 1;
                          // }
                          const iva = (importe * (ivaCalcular ?? 1)) / 100;
                          console.log("iva", iva);
                          console.log("iva", iva);
                          const total = importe + iva;
                          conceptsForm.setValue(
                            `concepts.${index}.total`,
                            total
                          );
                          conceptsForm.setValue(`concepts.${index}.iva`, iva);
                          if (onValueChange) onValueChange();
                        }}
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
                // Mostrar el IVA como porcentaje
                value: visualizationSwitcher(
                  visualization,
                  <p className="px-[12px] py-[8px]">
                    {(
                      conceptsForm.getValues(`concepts.${index}.iva`) ?? 0
                    ).toFixed(2)}
                  </p>,
                  (
                    conceptsForm.getValues(`concepts.${index}.iva`) ?? 0
                  ).toFixed(2)
                ),
              }}
            />
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "TOTAL",
                value: visualizationSwitcher(
                  visualization,
                  <p className="px-[12px] py-[8px]">
                    {(
                      conceptsForm.getValues(`concepts.${index}.total`) ?? 0
                    ).toFixed(2)}
                  </p>,
                  (
                    conceptsForm.getValues(`concepts.${index}.total`) ?? 0
                  ).toFixed(2)
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
                    append({
                      concepto: "",
                      importe: 0,
                      iva: parseInt(form.watch("alicuota")),
                      total: 0,
                    })
                  }>
                  <AddCircleIcon className="text-[#8bd087]" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  className="bg-transparent hover:bg-transparent border-none shadow-none"
                  onClick={() => {
                    remove(index);
                    if (onValueChange) onValueChange();
                  }}>
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
                  id: "",
                })
              }>
              Agregar comprobante
            </Button>
          </div>
        )}
        <Form {...asociatedFCForm}>
          <form>
            {asocFields.map((fieldElement, index) => (
              <div
                className="w-full grid grid-flow-col gap-5 justify-stretch items-center"
                key={index}>
                <ElementCard
                  className="pr-1 pb-0 border-[#bef0bb]"
                  element={{
                    key: "COMPROBANTE ASOCIADO",
                    // value: visualizationSwitcher(
                    //   visualization,
                    //   <FormField
                    //     control={asociatedFCForm.control}
                    //     name={`comprobantes.${index}.tipoComprobante`}
                    //     render={({ field }) => (
                    //       <FormItem>
                    //         <Select
                    //           onValueChange={(e) => {
                    //             asociatedFCForm.setValue(
                    //               `comprobantes.${index}.tipoComprobante`,
                    //               reverseComprobanteDictionary[Number(e)]!
                    //             );
                    //             setCurrentCompType(e);
                    //           }}
                    //           defaultValue={field.value}
                    //         >
                    //           <FormControl>
                    //             <SelectTrigger className="border-none focus:ring-transparent px-0 py-0 h-8">
                    //               <SelectValue placeholder="Seleccionar tipo comprobante..." />
                    //             </SelectTrigger>
                    //           </FormControl>
                    //           <SelectContent>
                    //             <SelectItem value="1">FACTURA A</SelectItem>
                    //             <SelectItem value="6">FACTURA B</SelectItem>
                    //           </SelectContent>
                    //         </Select>
                    //       </FormItem>
                    //     )}
                    //   />,
                    //   fieldElement.tipoComprobante
                    // ),
                    value: visualizationSwitcher(
                      visualization,
                      <p className="px-[12px] py-[8px]">
                        {possibleComprobanteTipo}
                      </p>,
                      possibleComprobanteTipo
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
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={(e) => {
                                for (const comprobante of comprobantes ?? []) {
                                  if (comprobante.id === e) {
                                    setFcSeleccionada([
                                      ...fcSeleccionada,
                                      comprobante,
                                    ]);

                                    asociatedFCForm.setValue(
                                      `comprobantes.${index}.nroComprobante`,
                                      comprobante.nroComprobante.toString()
                                    );
                                    asociatedFCForm.setValue(
                                      `comprobantes.${index}.id`,
                                      comprobante.id.toString()
                                    );

                                    asociatedFCForm.setValue(
                                      `comprobantes.${index}.puntoVenta`,
                                      comprobante.ptoVenta.toString()
                                    );
                                    asociatedFCForm.setValue(
                                      `comprobantes.${index}.dateEmision`,
                                      comprobante.generated
                                    );

                                    asociatedFCForm.setValue(
                                      `comprobantes.${index}.importe`,
                                      comprobante.importe
                                    );
                                    asociatedFCForm.setValue(
                                      `comprobantes.${index}.iva`,
                                      Number(comprobante.iva)
                                    );

                                    if (onValueChange) onValueChange();
                                    break;
                                  }
                                }
                              }}
                              defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar comprobante..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {comprobantes
                                  ?.filter(
                                    (comprobante) =>
                                      comprobante.tipoComprobante ===
                                        possibleComprobanteTipo &&
                                      (comprobante.estado?.toUpperCase() === "PARCIAL" ||
                                        comprobante.estado?.toUpperCase() === "PENDIENTE")
                                  )
                                  .slice(0, 10)
                                  .map((comprobante) => (
                                    <SelectItem
                                      key={comprobante.id}
                                      value={comprobante.id}>
                                      {comprobante.nroComprobante +
                                        " - " +
                                        comprobante.importe}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
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
                          <FormItem>
                            <Popover>
                              <PopoverTrigger asChild={true}>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                                      !field.value && "text-muted-foreground"
                                    )}
                                    disabled>
                                    {field.value &&
                                    dayjs(field.value).isValid() ? (
                                      format(field.value, "dd/MM/yyyy")
                                    ) : (
                                      <span>Seleccionar fecha</span>
                                    )}
                                    <Calendar01Icon className="h-4 w-4" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  initialFocus={true}
                                  onSelect={(date) => field.onChange(date)}
                                  selected={field.value ?? new Date()}
                                />
                              </PopoverContent>
                            </Popover>
                          </FormItem>
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
                      onClick={() => {
                        asocRemove(index);
                        if (onValueChange) onValueChange();
                      }}>
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
                          id: "",
                        })
                      }>
                      <AddCircleIcon className="text-[#8bd087]" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </form>
        </Form>
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
              <p> No se agregaran conceptos</p>
              <Button
                onClick={() =>
                  otherConceptsAppend({ description: "", importe: 0 })
                }>
                Agregar concepto
              </Button>
            </div>
          )}
          {otherConceptsFields.map((fieldElement, index) => (
            <div
              key={fieldElement.id}
              className="w-full grid grid-flow-col gap-5 justify-stretch items-center">
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
                      render={({ field }) => (
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (onValueChange) onValueChange();
                          }}
                          type="number"
                        />
                      )}
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
                    }>
                    <AddCircleIcon className="text-[#8bd087]" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-transparent hover:bg-transparent border-none shadow-none"
                    onClick={(e) => {
                      otherConceptsRemove(index);
                      if (onValueChange) onValueChange();
                    }}>
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
