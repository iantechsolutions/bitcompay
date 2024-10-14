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
import { idDictionary, ivaDictionary } from "~/lib/utils";

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
  name: string;
  document: string;
  afip: any;
  fiscal_document:string;
  iva: string;
  sell_condition:string
  otherAttributes: number;
}

function formatDate(date: Date | undefined) {
  if (date) {
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return year + month + day;
  }
  return null;
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
  name,
  document,
  fiscal_document,
  iva,
  afip,
  sell_condition
}: Props) => {
  // function generateComprobante(){

  // }

  function handleApprove() {
    console.log("fcSeleccionada");
    console.log(fcSeleccionada);
    console.log("otherTributes");
    console.log(otherTributes.getValues());
    console.log("form");
    console.log(form.getValues());
    console.log("asociatedFCForm");
    console.log(asociatedFCForm.getValues());
    console.log("conceptsForm");
    console.log(conceptsForm.getValues());
    console.log("otherConcepts");
    console.log(otherConcepts.getValues());
    console.log("subTotal");
    console.log(subTotal);
    console.log("ivaTotal");
    console.log(ivaTotal);
    console.log("otherAttributes");
    console.log(otherAttributes);
  }
  // async function handleAFIP() {
  //   const formValues = form.getValues()
  //   const concepto = formValues.tipoDeConcepto;
  //   let last_voucher = 0;
  //   let data = null;
  //   let ivaFloat =
  //         (100 + parseFloat(ivaDictionary[Number(iva)] ?? "0")) / 100;
  //   const fecha = new Date(
  //     Date.now() - new Date().getTimezoneOffset() * 60000
  //   ).toISOString()
    
  //   .split("T")[0];
  //   if (tipoComprobante == "1" || tipoComprobante == "6") {
  //       try {
  //         last_voucher = await afip.ElectronicBilling.getLastVoucher(
  //           form.getValues().puntoVenta,
  //           tipoComprobante
  //         );
  //       } catch {
  //         last_voucher = 0;
  //       }



  //       data = {
  //         CantReg: 1, // Cantidad de comprobantes a registrar
  //         PtoVta: Number(form.getValues().puntoVenta),
  //         CbteTipo: Number(tipoComprobante),
  //         Concepto: Number(concepto),
  //         DocTipo: idDictionary[tipoDocumento ?? ""],
  //         DocNro: fiscal_document ?? 0,
  //         CbteDesde: last_voucher + 1,
  //         CbteHasta: last_voucher + 1,
  //         CbteFch: parseInt(fecha?.replace(/-/g, "") ?? ""),
  //         FchServDesde:
  //           concepto != "1"
  //             ? formatDate(form.getValues().dateDesde ?? new Date())
  //             : null,
  //         FchServHasta:
  //           concepto != "1"
  //             ? formatDate(form.getValues().dateHasta ?? new Date())
  //             : null,
  //         FchVtoPago:
  //           concepto != "1"
  //             ? formatDate(form.getValues().dateVencimiento ?? new Date())
  //             : null,
  //         ImpTotal:
  //           Math.round(
  //             100 * (Number(importe) * ivaFloat + Number(tributos))
  //           ) / 100,
  //         ImpTotConc: 0,
  //         ImpNeto: Number(importe),
  //         ImpOpEx: 0,
  //         ImpIVA:
  //           Math.round(
  //             100 * (Number(importe ?? 0) * ivaFloat - Number(importe))
  //           ) / 100,
  //         ImpTrib: 0,
  //         MonId: "PES",
  //         MonCotiz: 1,
  //         Iva: {
  //           Id: iva,
  //           BaseImp: Number(importe),
  //           Importe:
  //             Math.round(
  //               100 * (Number(importe ?? 0) * ivaFloat - Number(importe))
  //             ) / 100,
  //         },
  //       };



  //   }



  // }
  return (
    <section className="space-y-2 flex flex-col">
      <Title>Resumen de datos</Title>

      <ReceptorCard
        nombre={name}
        nroDocumentoDNI={document}
        nroDocumento={fiscal_document}
        conditionIVA={iva}
        conditionVenta={sell_condition}
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
            // handleCreate();
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
