import {
  ChevronLeftCircleIcon,
  CircleCheck,
  CircleX,
  Download,
  Loader2Icon,
  RefreshCcw,
} from "lucide-react";
import { Title } from "../title";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { UseFormReturn } from "react-hook-form";
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
import {
  comprobanteDictionary,
  htmlBill,
  idDictionary,
  ivaDictionary,
  reverseComprobanteDictionary,
  reversedIvaDictionary,
} from "~/lib/utils";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useState } from "react";
import { saveAs } from "file-saver";

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
  fiscal_document: string;
  ivaCondition: string;
  sell_condition: string;
  otherAttributes: number;
  document_type: string;
  fgId?: string;
  osId?: string;
  brandId?: string;
  company?: any;
  gruposFamiliar?: any;
  obrasSociales?: any;
  marcas?: any;
  createdComprobante: Comprobante;
  reloadPage: () => void;
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
  fgId,
  osId,
  subTotal,
  ivaTotal,
  otherAttributes,
  name,
  document,
  fiscal_document,
  ivaCondition,
  afip,
  sell_condition,
  document_type,
  brandId,
  company,
  gruposFamiliar,
  obrasSociales,
  marcas,
  createdComprobante,
  reloadPage,
}: Props) => {
  // function generateComprobante(){

  // }
  const [loading, setIsLoading] = useState(false);
  const [finishedAFIP, setFinishedAFIP] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [loadingDownload, setLoadingDownload] = useState(false);
  const { mutateAsync: createEventFamily } =
    api.events.createByType.useMutation();
  const { mutateAsync: createEventOS } =
    api.events.createByTypeOS.useMutation();
  const { mutateAsync: createEventOrg } =
    api.events.createByTypeOrg.useMutation();
  const { mutateAsync: updateComprobante } =
    api.comprobantes.approbate.useMutation();
  const router = useRouter();

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

  async function handleDownload() {
    try {
      setLoadingDownload(true);
      if (url !== null) {
        const req = await fetch(url);
        const blob = await req.blob();
        saveAs(blob, "comprobante.pdf");
      }
      setLoadingDownload(false);
    } catch (e) {
      toast.error("Error descargando el archivo");
      setLoadingDownload(false);
    }
  }

  async function handleAFIP() {
    setIsLoading(true);
    handleApprove();
    const formValues = form.getValues();
    const concepto = formValues.tipoDeConcepto;
    const iva = formValues.alicuota
      ? formValues.alicuota
      : reversedIvaDictionary[fcSeleccionada[0]?.iva ?? ""];
    // sum of concepts amount
    const importe = conceptsForm
      .getValues()
      .concepts.reduce((acc, concept) => acc + concept.importe, 0);
    const tributos = otherAttributes;
    let last_voucher = 0;
    let data = null;
    console.log();
    let ivaFloat = (100 + parseFloat(ivaDictionary[Number(iva)] ?? "0")) / 100;
    const fecha = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
    const fcSelec = asociatedFCForm.getValues().comprobantes[0]?.id;
    if (tipoComprobante == "1" || tipoComprobante == "6") {
      try {
        last_voucher = await afip.ElectronicBilling.getLastVoucher(
          form.getValues().puntoVenta,
          tipoComprobante
        );
      } catch {
        last_voucher = 0;
      }
      data = {
        CantReg: 1, // Cantidad de comprobantes a registrar
        PtoVta: Number(form.getValues().puntoVenta),
        CbteTipo: Number(tipoComprobante),
        Concepto: Number(concepto),
        DocTipo: idDictionary[document_type ?? ""],
        DocNro: fiscal_document ?? 0,
        CbteDesde: last_voucher + 1,
        CbteHasta: last_voucher + 1,
        CbteFch: parseInt(fecha?.replace(/-/g, "") ?? ""),
        FchServDesde:
          concepto != "1"
            ? formatDate(form.getValues().dateDesde ?? new Date())
            : null,
        FchServHasta:
          concepto != "1"
            ? formatDate(form.getValues().dateHasta ?? new Date())
            : null,
        FchVtoPago:
          concepto != "1"
            ? formatDate(form.getValues().dateVencimiento ?? new Date())
            : null,
        ImpTotal:
          Math.round(100 * (Number(importe) * ivaFloat + Number(tributos))) /
          100,
        ImpTotConc: 0,
        ImpNeto: Number(importe),
        ImpOpEx: 0,
        ImpIVA:
          Math.round(
            100 * (Number(importe ?? 0) * ivaFloat - Number(importe))
          ) / 100,
        ImpTrib: 0,
        MonId: "PES",
        MonCotiz: 1,
        Iva: {
          Id: iva,
          BaseImp: Number(importe),
          Importe:
            Math.round(
              100 * (Number(importe ?? 0) * ivaFloat - Number(importe))
            ) / 100,
        },
      };
    } else if (tipoComprobante == "0") {
    } else if (
      fcSeleccionada &&
      (tipoComprobante == "3" || tipoComprobante == "8")
    ) {
      // const facSeleccionada = comprobantes?.find((x) => x.id == fcSelec);
      let ivaFloat = (100 + parseFloat(fcSeleccionada[0]?.iva ?? "0")) / 100;
      try {
        last_voucher = await afip.ElectronicBilling.getLastVoucher(
          form.getValues().puntoVenta,
          tipoComprobante
        );
      } catch {
        last_voucher = 0;
      }

      data = {
        CantReg: 1, // Cantidad de comprobantes a registrar
        PtoVta: fcSeleccionada[0]?.ptoVenta,
        CbteTipo: Number(tipoComprobante),
        Concepto: Number(fcSeleccionada[0]?.concepto),
        DocTipo: Number(fcSeleccionada[0]?.tipoDocumento),
        DocNro: fcSeleccionada[0]?.nroDocumento ?? "0",
        CbteDesde: last_voucher + 1,
        CbteHasta: last_voucher + 1,
        CbteFch: parseInt(fecha?.replace(/-/g, "") ?? ""),
        FchServDesde:
          concepto != "1"
            ? formatDate(fcSeleccionada[0]?.fromPeriod ?? new Date())
            : null,
        FchServHasta:
          concepto != "1"
            ? formatDate(fcSeleccionada[0]?.toPeriod ?? new Date())
            : null,
        FchVtoPago:
          concepto != "1"
            ? formatDate(fcSeleccionada[0]?.due_date ?? new Date())
            : null,
        ImpTotal: fcSeleccionada[0]?.importe,
        ImpTotConc: 0,
        ImpNeto:
          (Number(fcSeleccionada[0]?.importe) / ivaFloat).toFixed(2) ?? "0",
        ImpOpEx: 0,
        ImpIVA:
          Math.round(
            100 *
              ((fcSeleccionada[0]?.importe ?? 0) -
                Number(fcSeleccionada[0]?.importe) / ivaFloat)
          ) / 100,

        ImpTrib: 0,
        MonId: "PES",
        MonCotiz: 1,
        Iva: {
          Id: reversedIvaDictionary[fcSeleccionada[0]?.iva ?? "0"],
          BaseImp: (Number(fcSeleccionada[0]?.importe) / ivaFloat).toFixed(2),
          Importe:
            Math.round(
              100 *
                ((fcSeleccionada[0]?.importe ?? 0) -
                  parseFloat(
                    (Number(fcSeleccionada[0]?.importe) / ivaFloat).toFixed(2)
                  ))
            ) / 100,
        },
        CbtesAsoc: {
          Tipo: comprobanteDictionary[fcSeleccionada[0]?.tipoComprobante ?? ""],
          PtoVta: fcSeleccionada[0]?.ptoVenta ?? 1,
          Nro: fcSeleccionada[0]?.nroComprobante ?? 0,
        },
      };
    } else {
      toast.error("Error, revise que todos los campos esten completos");
      setIsLoading(false);
      return null;
    }

    if (data) {
      try {
        const res = await afip.ElectronicBilling.createVoucher(data);
      } catch (error) {
        console.log(error);
        toast.error("Error enviando a AFIP: " + error);
        setIsLoading(false);
        return null;
      }
    }
    if (tipoComprobante == "1" || tipoComprobante == "6") {
      if (fgId) {
        const event = createEventFamily({
          family_group_id: fgId,
          type: "FC",
          amount: createdComprobante.importe ?? 0,
          comprobante_id: createdComprobante.id ?? "",
        });
      } else if (osId) {
        const event = createEventOS({
          health_insurance_id: osId ?? "",
          type: "FC",
          amount: createdComprobante.importe ?? 0,
          comprobante_id: createdComprobante.id ?? "",
        });
      }
    } else if (tipoComprobante == "0") {
      if (fgId) {
        const event = createEventFamily({
          family_group_id: fgId,
          type: "REC",
          amount: createdComprobante.importe ?? 0,
          comprobante_id: createdComprobante.id ?? "",
        });
      } else if (osId) {
        const event = createEventOS({
          health_insurance_id: osId,
          type: "REC",
          amount: createdComprobante.importe ?? 0,
          comprobante_id: createdComprobante.id ?? "",
        });
      }

      // const eventOrg = createEventOrg({
      //   type: "REC",
      //   amount: createdComprobante.importe ?? 0,
      //   comprobante_id: createdComprobante.id ?? "",
      // });
    } else if (
      fcSeleccionada &&
      (tipoComprobante == "3" || tipoComprobante == "8")
    ) {
      if (fgId) {
        const event = createEventFamily({
          family_group_id: fgId,
          type: "NC",
          amount: fcSeleccionada[0]?.importe ?? 0,
          comprobante_id: createdComprobante.id ?? "",
        });
      } else if (osId) {
        const event = createEventOS({
          health_insurance_id: osId,
          type: "NC",
          amount: fcSeleccionada[0]?.importe ?? 0,
          comprobante_id: createdComprobante.id ?? "",
        });
      }
    }
    const billResponsible = gruposFamiliar
      ?.find((x: { id: string }) => x.id == fgId)
      ?.integrants.find((x: { isBillResponsible: any }) => x.isBillResponsible);
    const obraSocial = obrasSociales?.find((x: { id: string }) => x.id == osId);

    //reemplazar por comprobante creado
    if (createdComprobante) {
      console.log(createdComprobante, "createdComprobante");
      const html = htmlBill(
        createdComprobante,
        company,
        undefined,
        2,
        marcas?.find((x: { id: string }) => x.id === brandId),
        name,
        billResponsible
          ? billResponsible?.address ??
              "" + " " + (billResponsible?.address_number ?? "")
          : obraSocial?.adress ?? "",
        (billResponsible ? billResponsible?.locality : obraSocial?.locality) ??
          "",
        (billResponsible ? billResponsible?.province : obraSocial?.province) ??
          "",
        (billResponsible
          ? billResponsible?.postal_code?.cp
          : obraSocial?.cpData?.cp) ?? "",
        (billResponsible
          ? billResponsible?.fiscal_id_type
          : obraSocial?.fiscal_id_type) ?? "",
        (billResponsible
          ? billResponsible?.fiscal_id_number
          : obraSocial?.fiscal_id_number?.toString()) ?? "",
        (billResponsible
          ? billResponsible?.afip_status
          : obraSocial?.afip_status) ?? ""
      );
      const options = {
        width: 8, // Ancho de pagina en pulgadas. Usar 3.1 para ticket
        marginLeft: 0.8, // Margen izquierdo en pulgadas. Usar 0.1 para ticket
        marginRight: 0.8, // Margen derecho en pulgadas. Usar 0.1 para ticket
        marginTop: 0.4, // Margen superior en pulgadas. Usar 0.1 para ticket
        marginBottom: 0.4, // Margen inferior en pulgadas. Usar 0.1 para ticket
      };
      const pdfname = (last_voucher + 1).toString() + ".pdf";
      const resHtml = await afip.ElectronicBilling.createPDF({
        html: html,
        file_name: pdfname,
        options: options,
      });

      const updatedComprobante = await updateComprobante({
        id: createdComprobante.id ?? "",
        billLink: resHtml.file,
        number: last_voucher + 1,
        state: "pendiente",
      });

      toast.success("La factura se creo correctamente");
      setIsLoading(false);
      setFinishedAFIP(true);
      setUrl(resHtml.file);
      // reloadPage();

      // if (resHtml.file) {
      //   // window.open(resHtml.file, "_blank");
      // }
    } else {
      toast.error(
        "Error creando el comprobante, la factura ya fue enviada a AFIP"
      );
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-2 flex flex-col">
      <Title>Resumen de datos</Title>

      <ReceptorCard
        nombre={name}
        nroDocumentoDNI={document}
        nroDocumento={fiscal_document}
        conditionIVA={ivaCondition}
        conditionVenta={sell_condition}
      />

      <ComprobanteCard
        visualization={true}
        form={form}
        tipoComprobante={tipoComprobante}
        setTipoComprobante={setTipoComprobante}
      />

      <AdditionalInfoCard
        // comprobantes={}
        possibleComprobanteTipo={fcSeleccionada[0]?.tipoComprobante ?? ""}
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

      {!finishedAFIP && (
        <div className="self-end flex gap-1">
          <Button
            onClick={() => changePage("formPage")}
            className="h-7 bg-[#f7f7f7] hover:bg-[#f7f7f7] text-[#3e3e3e] font-medium-medium text-sm rounded-2xl py-4 px-4 shadow-none">
            <ChevronLeftCircleIcon className="mr-2 h-4 w-auto" /> Volver
          </Button>

          <>
            <Button
              className="h-7 bg-[#BEF0BB] hover:bg-[#BEF0BB] text-[#3e3e3e] font-medium-medium text-sm rounded-2xl py-4 px-4 shadow-none"
              onClick={() => {
                // handleCreate();
                handleAFIP();
                // handleCreate();
              }}
              disabled={loading}>
              {loading ? (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              ) : (
                <CircleCheck className="h-4 w-auto mr-2" />
              )}
              Aprobar
            </Button>
            <Button className="h-7 bg-[#f9c3c3] hover:bg-[#f9c3c3] text-[#4B4B4B] text-sm rounded-2xl py-4 px-4 shadow-none">
              <CircleX className="h-4 w-auto mr-2" />
              Anular
            </Button>
          </>
        </div>
      )}


{finishedAFIP && 
      <div className=" self-start flex gap-1">
          <Button
            className="h-7 bg-[#BEF0BB] hover:bg-[#BEF0BB] text-[#3e3e3e] font-medium-medium text-sm rounded-2xl py-4 px-4 shadow-none"
            onClick={() => {
              // handleCreate();
              handleDownload();
              // handleCreate();
            }}
            disabled={loading}>
            {loading ? (
              <Loader2Icon className="mr-2 animate-spin" size={20} />
            ) : (
              <Download className="h-4 w-auto mr-2" />
            )}
            Descargar
          </Button>
          <Button
            className="h-7 bg-[#f9c3c3] hover:bg-[#f9c3c3] text-[#4B4B4B] text-sm rounded-2xl py-4 px-4 shadow-none"
            onClick={() => {
              if (reloadPage) {
                reloadPage();
              }
            }}>
            <RefreshCcw className="h-4 w-auto mr-2" />
            Crear nueva
          </Button>
        </div>
      )}
    </section>
  );
};

export default confirmationPage;
