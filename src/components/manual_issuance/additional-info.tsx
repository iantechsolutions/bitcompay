import ElementCard from "../affiliate-page/element-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { valueToNameComprobanteMap } from "~/lib/utils";
import GeneralCard from "./general-card";
import { UseFormReturn } from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import CancelCircleIcon from "../icons/cancel-circle-stroke-rounded";
import AddCircleIcon from "../icons/add-circle-stroke-rounded";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FormField } from "../ui/form";
import { RouterOutputs } from "~/trpc/shared";
import PaymentMethods from "./payment-methods";
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

  const AdditionalInfoMap: Record<string, React.ReactNode> = {
    default: <></>,
    Factura: (
      <GeneralCard title="Conceptos" containerClassName="flex flex-col gap-5">
        {fields.length === 0 && (
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
          <div key={fieldElement.id} className="flex gap-5 items-center">
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "CONCEPTO",
                value: (
                  <FormField
                    control={conceptsForm.control}
                    name={`concepts.${index}.concepto`}
                    render={({ field }) => (
                      <Input {...field} value={field.value ?? ""} />
                    )}
                  />
                ),
              }}
            />
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "IMPORTE",
                value: (
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
                  />
                ),
              }}
            />
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "IVA",
                value: (
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
                  />
                ),
              }}
            />
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "TOTAL",
                value: (
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
                  />
                ),
              }}
            />
            <Button
              variant="outline"
              size="icon"
              type="button"
              className="bg-transparent hover:bg-transparent border-none shadow-none"
              onClick={() => remove(index)}
            >
              <CancelCircleIcon className="text-[#ed4444]" />
            </Button>
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
          <div className="flex gap-4 mt-4 items-center">
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "COMPROBANTE ASOCIADO",
                value: (
                  <Select>
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
                ),
              }}
            />
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "PTO. VTA.",
                value: <Input type="number" />,
              }}
            />
            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "COMPROBANTE",
                value: <Input type="number" />,
              }}
            />

            <ElementCard
              className="pr-1 pb-0 border-[#bef0bb]"
              element={{
                key: "FECHA DE EMISION",
                value: <Input type="date" />,
              }}
            />
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
        ))}
      </GeneralCard>
    ),
    Recibo: (
      <>
        <GeneralCard title="Medios de Pago">
          <PaymentMethods />
        </GeneralCard>
        <GeneralCard title="Otros conceptos" containerClassName="">
          {otherConceptsFields.length === 0 && (
            <div className="flex justify-between px-2">
              <p> no se agregaran conceptos</p>
              <Button
                onClick={() => otherConceptsAppend({ description: "", importe: 0 })}
              >
                Agregar concepto
              </Button>
            </div>
          )}
          {otherConceptsFields.map((fieldElement, index) => (
          <div key={fieldElement.id} className="flex gap-3 mt-3 items-center">
            <ElementCard
              element={{ key: "Descripcion", value: <Input /> }}
              className=" grow pr-1 pb-0 border-[#bef0bb]"
            />
            <ElementCard
              element={{ key: "Importe", value: <Input type="number" /> }}
              className="pr-1 pb-0 border-[#bef0bb]"
            />
            <Button
              variant="outline"
              size="icon"
              className="bg-transparent hover:bg-transparent border-none shadow-none"
              onClick={() => otherConceptsAppend({ description: "", importe: 0 })}
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
          ))}
        </GeneralCard>
      </>
    ),
  };
  const comprobanteValueTipo = valueToNameComprobanteMap[tipoComprobante];
  return <>{AdditionalInfoMap[comprobanteValueTipo ?? "default"]}</>;
}
