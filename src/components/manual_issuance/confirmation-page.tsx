import {
  ChevronLeftCircleIcon,
  ChevronRightCircleIcon,
  CircleCheck,
  CircleX,
} from "lucide-react";
import { Title } from "../title";
import GeneralCard from "./general-card";
import { Button } from "../ui/button";
import { UseFormReturn } from "react-hook-form";
import ElementCard from "../affiliate-page/element-card";
import ReceptorCard from "./receptor-card";
import ComprobanteCard from "./comprobante-card";
import AdditionalInfoCard from "./additional-info";
import OtherTributes from "./other-tributes";
import Totals from "./totals";
import {
  type ConceptsForm,
  type ManualGenInputs,
  type OtherTributesForm,
  type AsociatedFCForm,
  type otherConceptsForm,
} from "~/lib/types/app";
import { Comprobante } from "~/server/db/schema";

interface Props {
  changePage: (page: "formPage" | "confirmationPage") => void;
  fcSeleccionada: Comprobante[];
  setFcSeleccionada: (fc: Comprobante[]) => void;
  form: UseFormReturn<ManualGenInputs>;
  otherTributes: UseFormReturn<OtherTributesForm>;
  tipoComprobante: string;
  asociatedFCForm: UseFormReturn<AsociatedFCForm>;
  conceptsForm: UseFormReturn<ConceptsForm>;
  otherConcepts: UseFormReturn<otherConceptsForm>;
  setTipoComprobante: (tipoComprobante: string) => void;
  subTotal: number;
  ivaTotal: number;
  otherAttributes: number;
}
const confirmationPage = ({
  changePage,
  fcSeleccionada,
  setFcSeleccionada,
  form,
  otherTributes,
  tipoComprobante,
  asociatedFCForm,
  setTipoComprobante,
  conceptsForm,
  otherConcepts,
  subTotal,
  ivaTotal,
  otherAttributes,
}: Props) => {
  function handleApprove() {
    alert("Aprobado");
  }
  function handleCreate() {
    alert("Creado");
  }
  return (
    <section className="space-y-2 flex flex-col">
      <Title>Resumen de datos</Title>

      <ReceptorCard
        nombre="Perea alejandro"
        nroDocumentoDNI="12345678"
        nroDocumento="12345678"
      />

      <ComprobanteCard
        visualization={true}
        form={form}
        tipoComprobante={tipoComprobante}
        setTipoComprobante={setTipoComprobante}
      />

      <AdditionalInfoCard
        fcSeleccionada={fcSeleccionada}
        setFcSeleccionada={setFcSeleccionada}
        visualization={true}
        asociatedFCForm={asociatedFCForm}
        conceptsForm={conceptsForm}
        form={form}
        otherConceptsForm={otherConcepts}
        tipoComprobante={tipoComprobante}
      />
      <OtherTributes Visualization={true} otherTributes={otherTributes} />
      <Totals
        subTotal={subTotal}
        iva={ivaTotal}
        otherAttributes={otherAttributes}
      />
      <div className="self-end flex gap-1">
        <Button
          onClick={() => changePage("formPage")}
          className="h-7 bg-[#f7f7f7] hover:bg-[#f7f7f7] text-[#3e3e3e] font-medium-medium text-sm rounded-2xl py-4 px-4 shadow-none"
        >
          <ChevronLeftCircleIcon className="mr-2 h-4 w-auto" /> Volver
        </Button>
        <Button
          className="h-7 bg-[#BEF0BB] hover:bg-[#BEF0BB] text-[#3e3e3e] font-medium-medium text-sm rounded-2xl py-4 px-4 shadow-none"
          onClick={() => {
            handleApprove();
            handleCreate();
          }}
        >
          <CircleCheck className="h-4 w-auto mr-2" />
          Aprobar
        </Button>
        <Button className="h-7 bg-[#f9c3c3] hover:bg-[#f9c3c3] text-[#4B4B4B] text-sm rounded-2xl py-4 px-4 shadow-none">
          <CircleX className="h-4 w-auto mr-2" />
          Anular
        </Button>
      </div>
    </section>
  );
};

export default confirmationPage;
