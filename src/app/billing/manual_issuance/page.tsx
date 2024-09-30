"use client";
import Afip from "@afipsdk/afip.js";
import { format } from "date-fns";
import {
  Loader2Icon,
  PlusCircleIcon,
  CircleX,
  CircleCheck,
  Search,
  Scroll,
  ChevronRightCircleIcon,
  CircleChevronRight,
} from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import * as React from "react";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { ComboboxDemo } from "~/components/ui/combobox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  cn,
  htmlBill,
  ingresarAfip,
  comprobanteDictionary,
  reverseComprobanteDictionary,
  reversedIvaDictionary,
  ivaDictionary,
  idDictionary,
  dateNormalFormat,
  reverseConceptDictionary,
} from "~/lib/utils";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Comprobante } from "./facturaGenerada";
import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { create } from "domain";
import BarcodeProcedure from "~/components/barcode";
import { SelectTrigger as SelectTriggerMagnify } from "~/components/selectwithsearchIcon";
import { channel } from "diagnostics_channel";
import ElementCard from "~/components/affiliate-page/element-card";
import Calendar01Icon from "~/components/icons/calendar-01-stroke-rounded";
import { Command, CommandInput } from "~/components/ui/command";
import { CommandGroup, CommandItem } from "cmdk";
import { useForm, useFieldArray } from "react-hook-form";
import ComprobanteCard from "~/components/manual_issuance/comprobante-card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "~/components/ui/form";
import AdditionalInfoCard from "~/components/manual_issuance/additional-info";
import { RouterOutputs } from "~/trpc/shared";
import AddCircleIcon from "~/components/icons/add-circle-stroke-rounded";
import CancelCircleIcon from "~/components/icons/cancel-circle-stroke-rounded";
import OtherTributes from "~/components/manual_issuance/other-tributes";
import ConfirmationPage from "~/components/manual_issuance/confirmation-page";
import ReceptorCard from "~/components/manual_issuance/receptor-card";

function formatDate(date: Date | undefined) {
  if (date) {
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return year + month + day;
  }
  return null;
}

export default function Page() {
  const { mutateAsync: createComprobante } =
    api.comprobantes.create.useMutation();
  const { mutateAsync: updateComprobante } =
    api.comprobantes.addBillLinkAndNumber.useMutation();
  const { mutateAsync: createEventFamily } =
    api.events.createByType.useMutation();
  const { mutateAsync: createEventOrg } =
    api.events.createByTypeOrg.useMutation();
  const { data: company } = api.companies.get.useQuery();
  const { data: marcas } = api.brands.list.useQuery();
  const { data: gruposFamiliar } = api.family_groups.list.useQuery();
  const { data: obrasSociales } = api.healthInsurances.list.useQuery();

  const [logo, setLogo] = useState("");
  const [fcSelec, setFCSelec] = useState("");
  const [comprobantes, setComprobantes] = useState<any[]>();
  const [selectedComprobante, setSelectedComprobante] = useState<any>(null);
  const [comprobanteCreado, setComprobanteCreado] = useState<any>(null);
  const [afip, setAfip] = useState<any>(null);
  const router = useRouter();
  useEffect(() => {
    async function loginAfip() {
      const afip = await ingresarAfip();
      setLoading(false);
      const voucherTypes = await afip.ElectronicBilling.getVoucherTypes();
      const ivaTypes = await afip.ElectronicBilling.getAliquotTypes();
      setAfip(afip);
    }

    loginAfip();
  }, []);

  function generateComprobante() {
    if (marcas) {
      setLogo(marcas[0]?.logo_url ?? "");
    }

    if (
      !form.getValues().puntoVenta ||
      !form.getValues().dateEmision ||
      !tipoComprobante ||
      !concepto ||
      !iva ||
      !form.getValues().dateVencimiento ||
      !importe ||
      parseInt(importe) <= 0
    ) {
      toast.error("Ingrese los valores requeridos");
      return null;
    }
    if (
      concepto !== "1" &&
      (!form.getValues().dateDesde || !form.getValues().dateHasta)
    ) {
      toast.error("Ingrese los valores requeridos");
      return null;
    }
    try {
      (async () => {
        setLoading(true);
        let comprobante = null;
        let last_voucher = 0;
        let data = null;
        let ivaFloat =
          (100 + parseFloat(ivaDictionary[Number(iva)] ?? "0")) / 100;
        console.log("ivaFloat", ivaFloat);
        console.log("ImpTotal", importe);
        console.log("ImpNeto", (Number(importe) / ivaFloat).toFixed(2));
        console.log(
          "ImpIVA",
          Number(importe ?? "0") -
            parseFloat((Number(importe) / ivaFloat).toFixed(2))
        );
        const fecha = new Date(
          Date.now() - new Date().getTimezoneOffset() * 60000
        )
          .toISOString()
          .split("T")[0];

        if (fcSelec && (tipoComprobante == "3" || tipoComprobante == "8")) {
          const facSeleccionada = comprobantes?.find((x) => x.id == fcSelec);

          let ivaFloat = (100 + parseFloat(facSeleccionada?.iva ?? "0")) / 100;
          console.log("IMPORTE NC");
          console.log(facSeleccionada?.importe);
          console.log(
            Math.round(
              100 *
                ((facSeleccionada?.importe ?? 0) -
                  Number(facSeleccionada?.importe) / ivaFloat)
            ) / 100
          );
          console.log((Number(facSeleccionada?.importe) / ivaFloat).toFixed(2));

          comprobante = await createComprobante({
            billLink: "",
            concepto: facSeleccionada?.concepto ?? 0,
            importe: facSeleccionada?.importe ?? 0,
            iva: facSeleccionada?.iva ?? "0",
            nroDocumento: facSeleccionada?.nroDocumento ?? 0,
            ptoVenta: facSeleccionada?.ptoVenta ?? 0,
            tipoDocumento: facSeleccionada?.tipoDocumento ?? 0,
            tipoComprobante: reverseComprobanteDictionary[tipoComprobante],
            fromPeriod: facSeleccionada?.fromPeriod,
            toPeriod: facSeleccionada?.toPeriod,
            due_date: facSeleccionada?.due_date,
            generated: new Date(),
            prodName: facSeleccionada?.prodName ?? "",
            nroComprobante: facSeleccionada?.nroComprobante ?? 0,
            family_group_id: grupoFamiliarId,
            previous_facturaId: facSeleccionada?.id,
          });
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
            PtoVta: comprobante[0]?.ptoVenta,
            CbteTipo: Number(tipoComprobante),
            Concepto: Number(comprobante[0]?.concepto),
            DocTipo: Number(comprobante[0]?.tipoDocumento),
            DocNro: comprobante[0]?.nroDocumento ?? "0",
            CbteDesde: last_voucher + 1,
            CbteHasta: last_voucher + 1,
            CbteFch: parseInt(fecha?.replace(/-/g, "") ?? ""),
            FchServDesde:
              concepto != "1"
                ? formatDate(comprobante[0]?.fromPeriod ?? new Date())
                : null,
            FchServHasta:
              concepto != "1"
                ? formatDate(comprobante[0]?.toPeriod ?? new Date())
                : null,
            FchVtoPago:
              concepto != "1"
                ? formatDate(comprobante[0]?.due_date ?? new Date())
                : null,
            ImpTotal: comprobante[0]?.importe,
            ImpTotConc: 0,
            ImpNeto:
              (Number(comprobante[0]?.importe) / ivaFloat).toFixed(2) ?? "0",
            ImpOpEx: 0,
            ImpIVA:
              Math.round(
                100 *
                  ((comprobante[0]?.importe ?? 0) -
                    Number(comprobante[0]?.importe) / ivaFloat)
              ) / 100,

            ImpTrib: 0,
            MonId: "PES",
            MonCotiz: 1,
            Iva: {
              Id: reversedIvaDictionary[comprobante[0]?.iva ?? "0"],
              BaseImp: (Number(comprobante[0]?.importe) / ivaFloat).toFixed(2),
              Importe:
                Math.round(
                  100 *
                    ((comprobante[0]?.importe ?? 0) -
                      parseFloat(
                        (Number(comprobante[0]?.importe) / ivaFloat).toFixed(2)
                      ))
                ) / 100,
            },
            CbtesAsoc: {
              Tipo: comprobanteDictionary[
                facSeleccionada?.tipoComprobante ?? ""
              ],
              PtoVta: facSeleccionada?.ptoVenta ?? 1,
              Nro: facSeleccionada?.nroComprobante ?? 0,
            },
          };
          console.log("testtt");
          const event = createEventFamily({
            family_group_id: grupoFamiliarId,
            type: "NC",
            amount: comprobante[0]?.importe ?? 0,
            comprobante_id: comprobante[0]?.id ?? "",
          });
        } else if (tipoComprobante == "1" || tipoComprobante == "6") {
          let ivaFloat =
            (100 + parseFloat(ivaDictionary[Number(iva)] ?? "0")) / 100;
          // const billResponsible = gruposFamiliar
          //   ?.find((x) => x.id == grupoFamiliarId)
          //   ?.integrants.find((x) => x.isBillResponsible);
          comprobante = await createComprobante({
            billLink: "",
            concepto: Number(concepto) ?? 0,
            importe: Number(importe) * ivaFloat + Number(tributos) ?? 0,
            iva: iva ?? "0",
            nroDocumento: Number(nroDocumento) ?? 0,
            ptoVenta: Number(form.getValues().puntoVenta) ?? 0,
            tipoDocumento: idDictionary[tipoDocumento ?? ""] ?? 0,
            tipoComprobante: reverseComprobanteDictionary[tipoComprobante],
            fromPeriod: form.getValues().dateDesde,
            toPeriod: form.getValues().dateHasta,
            due_date: form.getValues().dateVencimiento,
            generated: new Date(),
            prodName: servicioprod ?? "",
            nroComprobante: 0,
            family_group_id: grupoFamiliarId,
          });
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
            DocTipo: idDictionary[tipoDocumento ?? ""],
            DocNro: nroDocumento ?? 0,
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
              Math.round(
                100 * (Number(importe) * ivaFloat + Number(tributos))
              ) / 100,
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
          const event = createEventFamily({
            family_group_id: grupoFamiliarId,
            type: "FC",
            amount: comprobante[0]?.importe ?? 0,
            comprobante_id: comprobante[0]?.id ?? "",
          });
        } else if (tipoComprobante == "0") {
          // iva = 0;

          //
          comprobante = await createComprobante({
            billLink: "", //deberiamos poner un link ?
            concepto: Number(concepto) ?? 0,
            importe: Number(importe) * ivaFloat + Number(tributos) ?? 0,
            iva: "0",
            nroDocumento: Number(nroDocumento) ?? 0,
            ptoVenta: Number(form.getValues().puntoVenta) ?? 0,
            tipoDocumento: idDictionary[tipoDocumento ?? ""] ?? 0,
            tipoComprobante: reverseComprobanteDictionary[tipoComprobante],
            fromPeriod: form.getValues().dateDesde,
            toPeriod: form.getValues().dateHasta,
            due_date: form.getValues().dateVencimiento,
            generated: new Date(),
            prodName: servicioprod ?? "",
            nroComprobante: 0,
            family_group_id: grupoFamiliarId,
          });

          const event = createEventFamily({
            family_group_id: grupoFamiliarId,
            type: "REC",
            amount: comprobante[0]?.importe ?? 0,
            comprobante_id: comprobante[0]?.id ?? "",
          });
          const eventOrg = createEventOrg({
            type: "REC",
            amount: comprobante[0]?.importe ?? 0,
            comprobante_id: comprobante[0]?.id ?? "",
          });
        }
        console.log("testtt2");

        if (data) {
          try {
            const res = await afip.ElectronicBilling.createVoucher(data);
          } catch (error) {
            console.log(error);
          }
        }
        const billResponsible = gruposFamiliar
          ?.find((x) => x.id == grupoFamiliarId)
          ?.integrants.find((x) => x.isBillResponsible);
        const obraSocial = obrasSociales?.find((x) => x.id == obraSocialId);

        if (comprobante && comprobante[0]) {
          const html = htmlBill(
            comprobante[0],
            company,
            undefined,

            2,
            marcas?.find((x) => x.id === brandId),
            nombre,
            billResponsible
              ? billResponsible?.address ??
                  "" + " " + (billResponsible?.address_number ?? "")
              : obraSocial?.adress ?? "",
            (billResponsible
              ? billResponsible?.locality
              : obraSocial?.locality) ?? "",
            (billResponsible
              ? billResponsible?.province
              : obraSocial?.province) ?? "",
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
          const name = (last_voucher + 1).toString() + ".pdf";
          const resHtml = await afip.ElectronicBilling.createPDF({
            html: html,
            file_name: name,
            options: options,
          });
          const updatedComprobante = await updateComprobante({
            id: comprobante[0]?.id ?? "",
            billLink: resHtml.file,
            number: last_voucher + 1,
          });
          console.log("resultadHTML", resHtml);
          if (resHtml.file) {
            window.open(resHtml.file, "_blank");
          }
        }
        setLoading(false);
        toast.success("La factura se creo correctamente");
        router.push("/dashboard");
      })();
    } catch {
      setLoading(false);
      toast.error("Error");
    }
  }

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
  type ConceptsForm = {
    concepts: {
      concepto: string;
      importe: number;
      iva: number;
      total: number;
    }[];
  };

  const [tipoComprobante, setTipoComprobante] = useState("");
  const [concepto, setConcepto] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [nroDocumento, setNroDocumento] = useState("");
  const [nroDocumentoDNI, setNroDocumentoDNI] = useState("");
  const [nombre, setNombre] = useState("");
  const [importe, setImporte] = useState("0");
  const [tributos, setTributos] = useState("0");
  const [servicioprod, setservicioprod] = useState("Servicio");
  const [obraSocialId, setObraSocialId] = useState("");
  const [iva, setIva] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [grupoFamiliarId, setGrupoFamiliarId] = useState("");
  const form = useForm<ManualGenInputs>({
    defaultValues: {
      puntoVenta: "",
      dateDesde: new Date(),
      dateHasta: new Date(),
      dateVencimiento: new Date(),
      dateEmision: new Date(),
      tipoDeConcepto: "",
      alicuota: "",
      facturasEmitidas: 0,
    },
  });
  const conceptsForm = useForm<ConceptsForm>({
    defaultValues: {
      concepts: [{ concepto: "", importe: 0, iva: 0, total: 0 }],
    },
  });
  type OtherTributesForm = {
    tributes: {
      tribute: string;
      jurisdiccion:string;
      base: number;
      aliquot: number;
      amount: number;
    }[];
  };
  const otherTributesForm = useForm<OtherTributesForm>({
    defaultValues: {
      tributes: [{ tribute: "", jurisdiccion: "",base: 0, aliquot: 0, amount: 0 }],
    },
  });
  type AsociatedFCForm = {
    comprobantes: {
      tipoComprobante: string;
      puntoVenta: string;
      nroComprobante: string;
      dateEmision: Date;
    }[];
  };
  const asociatedFCForm = useForm<AsociatedFCForm>({
    defaultValues: {
      comprobantes: [
        {
          tipoComprobante: "",
          puntoVenta: "",
          nroComprobante: "",
          dateEmision: new Date(),
        },
      ],
    },
  });

  type otherConceptsForm = {
    otherConcepts: {
      description: string;
      importe: number;
    }[];
  };
  const otherConceptsForm = useForm<otherConceptsForm>({
    defaultValues: { otherConcepts: [{ description: "", importe: 0 }] },
  });
  const [page, setPage] = useState<"formPage" | "confirmationPage">("formPage");
  function handlePageChange(page: "formPage" | "confirmationPage") {
    setPage(page);
  }
  const pagesMap: Record<string, React.ReactNode> = {
    formPage: <></>,
    confirmationPage: <></>,
  };
  const products = api.products.list.useQuery().data;
  const [brandId, setBrandId] = useState("");
  function handleGrupoFamilarChange(value: string) {
    setGrupoFamiliarId(value);
    setObraSocialId("");
    let grupo = gruposFamiliar?.find((x) => x.id == value);
    let billResponsible = grupo?.integrants.find((x) => x.isBillResponsible);
    setComprobantes(grupo?.comprobantes ?? []);
    setNroDocumento(billResponsible?.fiscal_id_number ?? "0");
    setNroDocumentoDNI(billResponsible?.id_number ?? "0");
    setNombre(billResponsible?.name ?? "");
    setTipoDocumento(billResponsible?.fiscal_id_type ?? "");
    setBrandId(grupo?.businessUnitData?.brandId ?? "");
  }
  function handleObraSocialChange(value: string) {
    setGrupoFamiliarId("");
    setObraSocialId(value);
    let obra = obrasSociales?.find((x) => x.id == value);
    setNroDocumento(obra?.fiscal_id_number?.toString() ?? "0");
    setNroDocumentoDNI("0" ?? "");
    setNombre(obra?.responsibleName ?? "");
    setTipoDocumento(obra?.fiscal_id_type ?? "");
  }
  function handleComprobanteChange(value: string) {
    setFCSelec(value);
    setSelectedComprobante(comprobantes?.find((x) => x.id == value));
  }
  let selectedBrand;

  const handleBrandChange = (value: string) => {
    selectedBrand = marcas?.find((marca) => marca.id === value);
    setBrandId(value);
  };

  if (!grupoFamiliarId && !obraSocialId) {
    return (
      <LayoutContainer>
        <section>
          <div>
            <Title>Generacion de comprobantes</Title>
          </div>
          <div className="flex flex-row justify-between gap-8 ">
            <Select
              onValueChange={(e) => handleGrupoFamilarChange(e)}
              value={grupoFamiliarId}
            >
              <SelectTriggerMagnify className=" w-full bg-[#FAFAFA] font-normal text-[#747474]">
                <SelectValue placeholder="Buscar afiliado.." />
              </SelectTriggerMagnify>
              <SelectContent>
                {gruposFamiliar &&
                  gruposFamiliar.map((gruposFamiliar) => (
                    <SelectItem
                      key={gruposFamiliar?.id}
                      value={gruposFamiliar?.id}
                      className="rounded-none"
                    >
                      {gruposFamiliar?.integrants.find((x) => x.isHolder)?.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(e) => handleObraSocialChange(e)}
              value={obraSocialId}
            >
              <SelectTriggerMagnify className="w-full bg-[#FAFAFA] font-normal text-[#747474]">
                <SelectValue placeholder="Buscar por obra social.." />
              </SelectTriggerMagnify>
              <SelectContent>
                {obrasSociales &&
                  obrasSociales.map((obrasSocial) => (
                    <SelectItem
                      key={obrasSocial?.id}
                      value={obrasSocial?.id}
                      className="rounded-none"
                    >
                      {obrasSocial?.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </section>
      </LayoutContainer>
    );
  }
  return (
    <>
      <LayoutContainer>
        {page === "formPage" && (
          <section className="space-y-5 flex flex-col">
            <div>
              <Title>Generación de comprobantes</Title>
            </div>
            <div className="flex flex-row justify-between">
              <p className=" text-lg font-semibold">Receptor</p>
              <div className="pb-2">
                <Button
                  className="h-7 bg-[#BEF0BB] hover:bg-[#BEF0BB] text-[#3e3e3e] font-medium-medium text-sm rounded-2xl py-4 px-4 mr-3 shadow-none"
                  // onClick={() => setOpen(true)}
                  disabled={loading}
                  onClick={generateComprobante}
                >
                  {loading ? (
                    <Loader2Icon className="mr-2 animate-spin" size={20} />
                  ) : (
                    <CircleCheck className="h-4 w-auto mr-2" />
                  )}
                  Aprobar
                </Button>
                <Button
                  className="  h-7 bg-[#f9c3c3] hover:bg-[#f9c3c3] text-[#4B4B4B]  text-sm rounded-2xl py-4 px-4 shadow-none "
                  // onClick={() => setOpen(true)}
                >
                  <CircleX className="h-4 w-auto mr-2" />
                  Anular
                </Button>
              </div>
            </div>

            <div className="flex flex-row justify-between gap-8 ">
              <Select
                onValueChange={(e) => handleGrupoFamilarChange(e)}
                value={grupoFamiliarId}
              >
                <SelectTriggerMagnify className=" w-full bg-[#FAFAFA] font-normal text-[#747474]">
                  <SelectValue placeholder="Buscar afiliado.." />
                </SelectTriggerMagnify>
                <SelectContent>
                  {gruposFamiliar &&
                    gruposFamiliar.map((gruposFamiliar) => (
                      <SelectItem
                        key={gruposFamiliar?.id}
                        value={gruposFamiliar?.id}
                        className="rounded-none"
                      >
                        {
                          gruposFamiliar?.integrants.find((x) => x.isHolder)
                            ?.name
                        }
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(e) => handleObraSocialChange(e)}
                value={obraSocialId}
              >
                <SelectTriggerMagnify className="w-full bg-[#FAFAFA] font-normal text-[#747474]">
                  <SelectValue placeholder="Buscar por obra social.." />
                </SelectTriggerMagnify>
                <SelectContent>
                  {obrasSociales &&
                    obrasSociales.map((obrasSocial) => (
                      <SelectItem
                        key={obrasSocial?.id}
                        value={obrasSocial?.id}
                        className="rounded-none"
                      >
                        {obrasSocial?.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <ReceptorCard 
              nombre={nombre}
              nroDocumento={nroDocumento}
              nroDocumentoDNI={nroDocumentoDNI}
            />

            <ComprobanteCard
              visualization={false}
              form={form}
              tipoComprobante={tipoComprobante}
              setTipoComprobante={setTipoComprobante}
            />

            <AdditionalInfoCard
              visualization={false}
              tipoComprobante={tipoComprobante}
              conceptsForm={conceptsForm}
              form={form}
              asociatedFCForm={asociatedFCForm}
              otherConceptsForm={otherConceptsForm}
            />

            <OtherTributes Visualization={false} otherTributes={otherTributesForm} />
            <div className="border rounded-lg px-4 pt-5 pb-8">
              <p className=" text-lg font-semibold">Totales</p>
              <div className="flex flex-row justify-between pb-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-[#747474]">SUB-TOTAL FACTURA</Label>
                  <Input
                    // disabled={true}
                    value={
                      "$ " +
                      (!selectedComprobante
                        ? importe
                        : selectedComprobante.iva == "0"
                        ? selectedComprobante?.importe
                        : (selectedComprobante?.importe /
                            Number(selectedComprobante.iva)) *
                          100)
                    }
                    onChange={(e) => setImporte(e.target.value.slice(2))}
                    className="bg-[#def5dd] text-[#85ce81] font-semibold rounded-lg opacity-100 border-[#e9fcf8] border"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-[#747474]">IMPORTE IVA</Label>
                  <Input
                    // disabled={true}
                    value={
                      "$ " +
                      (!selectedComprobante
                        ? (
                            (Number(importe) *
                              Number(ivaDictionary[Number(iva)])) /
                            100
                          ).toFixed(2)
                        : selectedComprobante.iva == "0"
                        ? "0"
                        : selectedComprobante?.importe -
                          (selectedComprobante?.importe /
                            Number(selectedComprobante.iva)) *
                            100)
                    }
                    className="bg-[#def5dd] text-[#85ce81] font-semibold  rounded-lg opacity-100 border-[#e9fcf8] border"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-[#747474]">OTROS ATRIBUTOS</Label>
                  <Input
                    // disabled={true}
                    value={"$ " + !selectedComprobante ? tributos : "0"}
                    // onChange={(e) => setTributos(e.target.value.slice(2))}
                    className="bg-[#def5dd] text-[#85ce81] font-semibold  rounded-lg opacity-100 border-[#e9fcf8] border"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-[#747474]">TOTAL</Label>
                  <Input
                    // disabled={true}
                    value={
                      "$ " +
                      (!selectedComprobante
                        ? (
                            Number(importe) +
                            (Number(importe) *
                              Number(ivaDictionary[Number(iva)])) /
                              100 +
                            Number(tributos)
                          ).toFixed(2)
                        : selectedComprobante?.importe)
                    }
                    className="bg-[#def5dd] text-[#85ce81] font-semibold rounded-lg  opacity-100 border-[#e9fcf8] border"
                  />
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="flex justify-between px-4 py-4 rounded-full self-end bg-[#BEF0BB] hover:bg-[#BEF0BB] text-[#3e3e3e]"
              onClick={() => setPage("confirmationPage")}
            >
              Siguiente <CircleChevronRight className="h-4 ml-2" />
            </Button>
          </section>
        )}
        {page === "confirmationPage" && (
          <ConfirmationPage
            form={form}
            conceptsForm={conceptsForm}
            otherConcepts={otherConceptsForm}
            setTipoComprobante={setTipoComprobante}
            tipoComprobante={tipoComprobante}
            asociatedFCForm={asociatedFCForm}
            otherTributes={otherTributesForm}
            changePage={handlePageChange}
          />
        )}
      </LayoutContainer>
    </>
  );
}

function svgToBase64(svgElement: SVGSVGElement): Promise<string> {
  return new Promise((resolve, reject) => {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      reject("No context available for canvas");
      return;
    }

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      const base64Image = canvas.toDataURL("image/png");
      resolve(base64Image);
    };
    img.onerror = reject;
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  });
}
