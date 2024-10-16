"use client";
import {
  Loader2Icon,
  CircleX,
  CircleCheck,
  CircleChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import * as React from "react";
import { Button } from "~/components/ui/button";
import {
  htmlBill,
  ingresarAfip,
  comprobanteDictionary,
  reversedIvaDictionary,
  ivaDictionary,
  idDictionary,
  valueToNameComprobanteMap,
  reverseComprobanteDictionary,
  fcAnc,
} from "~/lib/utils";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import LayoutContainer from "~/components/layout-container";
import { Title } from "~/components/title";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from "~/components/ui/select";
import { SelectTrigger as SelectTriggerMagnify } from "~/components/selectwithsearchIcon";
import { useForm } from "react-hook-form";
import ComprobanteCard from "~/components/manual_issuance/comprobante-card";
import AdditionalInfoCard from "~/components/manual_issuance/additional-info";
import OtherTributes from "~/components/manual_issuance/other-tributes";
import ConfirmationPage from "~/components/manual_issuance/confirmation-page";
import ReceptorCard from "~/components/manual_issuance/receptor-card";
import Totals from "~/components/manual_issuance/totals";
import {
  type ConceptsForm,
  type ManualGenInputs,
  type OtherTributesForm,
  type AsociatedFCForm,
  type otherConceptsForm,
} from "~/lib/types/app";
import { type Comprobante } from "~/server/db/schema";
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
  const { mutateAsync: createItem } = api.items.create.useMutation();
  const { mutateAsync: createTribute } = api.tributes.create.useMutation();
  const { data: company } = api.companies.get.useQuery();
  const { data: marcas } = api.brands.list.useQuery();
  const { data: gruposFamiliar } = api.family_groups.list.useQuery();
  const { data: obrasSociales } = api.healthInsurances.listClient.useQuery();
  const { data: comprobantesEntidad } = api.comprobantes.getByEntity.useQuery();
  const [subTotal, setSubTotal] = useState<number>(0);
  const [ivaTotal, setIvaTotal] = useState<number>(0);
  const [otherAttributes, setOtherAttributes] = useState<number>(0);
  const [logo, setLogo] = useState("");
  const [fcSelec, setFCSelec] = useState("");
  const [fcSeleccionada, setFcSeleccionada] = useState<Comprobante[]>([]);
  const [comprobantes, setComprobantes] = useState<any[]>();
  const [selectedComprobante, setSelectedComprobante] = useState<any>(null);
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

  function computeTotals() {
    let subTotal = 0;
    let ivaTotal = 0;
    let otherAttributes = 0;
    const res = otherTributesForm.getValues();
    for (const attribute of res.tributes) {
      otherAttributes += Number(attribute.amount);
    }
    console.log(conceptsForm.getValues().concepts);
    switch (valueToNameComprobanteMap[tipoComprobante]) {
      case "Factura":
        for (const concept of conceptsForm.getValues().concepts) {
          subTotal += Number(concept.total);
          ivaTotal += Number(concept.iva);
        }
      case "Recibo":
        for (const concepts of otherConceptsForm.getValues().otherConcepts) {
          subTotal += Number(concepts.importe);
        }
        const importe = form.getValues().facturasEmitidas.importe;
        subTotal += form.getValues().facturasEmitidas.importe;
      case "Nota de crédito":
        for (const comprobante of asociatedFCForm.getValues().comprobantes) {
          console.log("comprobante del forms", comprobante);
          subTotal += Number(comprobante.importe);
          ivaTotal += Number(comprobante.iva) * Number(comprobante.iva);
        }
    }
    console.log("subtotal", subTotal);
    setSubTotal(subTotal);
    setIvaTotal(ivaTotal);
    setOtherAttributes(otherAttributes);
  }

  function generateComprobante() {
    const formValues = form.getValues();
    const concepto = formValues.tipoDeConcepto;
    const iva = formValues.alicuota
      ? ivaDictionary[Number(formValues.alicuota)]
      : fcSeleccionada[0]?.iva;
    console.log("iva");
    console.log(iva);
    if (marcas) {
      setLogo(marcas[0]?.logo_url ?? "");
    }

    if (
      (tipoComprobante != "0" &&
        (!form.getValues().puntoVenta ||
          !form.getValues().dateEmision ||
          !tipoComprobante ||
          !iva ||
          !form.getValues().dateVencimiento ||
          !subTotal ||
          !tributos)) ||
      (tipoComprobante == "0" &&
        (!form.getValues().dateEmision ||
          !tipoComprobante ||
          !form.getValues().dateVencimiento ||
          !subTotal ||
          !tributos))
    ) {
      console.log(!form.getValues().puntoVenta);
      console.log(!form.getValues().dateEmision);
      console.log(!tipoComprobante);
      console.log(!concepto);
      console.log(!iva);
      console.log(!form.getValues().dateVencimiento);
      console.log(!subTotal);
      console.log(!tributos);

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
        let ivaFloat =
          (100 + parseFloat(ivaDictionary[Number(iva)] ?? "0")) / 100;

        if (tipoComprobante == "1" || tipoComprobante == "6") {
          let ivaFloat =
            (100 + parseFloat(ivaDictionary[Number(iva)] ?? "0")) / 100;

          comprobante = await createComprobante({
            billLink: "",
            estado: "pendiente",
            concepto: Number(concepto) ?? 0,
            importe: Number(subTotal) * ivaFloat + Number(tributos),
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
            health_insurance_id: obraSocialId,
          });
          const sumaTributos = otherTributesForm
            .getValues()
            .tributes.reduce((acc, tribute) => acc + Number(tribute.amount), 0);
          const comprobanteId = comprobante[0]?.id ?? "";

          for (const tribute of otherTributesForm.getValues().tributes) {
            const tributo = await createTribute({
              tribute: tribute.tribute,
              jurisdiction: tribute.jurisdiccion,
              base_imponible: tribute.base,
              amount: tribute.amount,
              alicuota: tribute.aliquot,
              comprobante_id: comprobanteId,
            });
          }
          const tributo = await createItem({
            amount: sumaTributos,
            concept: "Tributos",
            iva: 0,
            total: sumaTributos,
            comprobante_id: comprobanteId,
          });
          conceptsForm.getValues().concepts.forEach(async (concept) => {
            if (concept.importe > 0) {
              await createItem({
                amount: concept.importe,
                concept: concept.concepto,
                iva: concept.iva,
                total: concept.total,
                comprobante_id: comprobanteId,
              });
            }
          });
          // data = {
          //   CantReg: 1, // Cantidad de comprobantes a registrar
          //   PtoVta: Number(form.getValues().puntoVenta),
          //   CbteTipo: Number(tipoComprobante),
          //   Concepto: Number(concepto),
          //   DocTipo: idDictionary[tipoDocumento ?? ""],
          //   DocNro: nroDocumento ?? 0,
          //   CbteDesde: last_voucher + 1,
          //   CbteHasta: last_voucher + 1,
          //   CbteFch: parseInt(fecha?.replace(/-/g, "") ?? ""),
          //   FchServDesde:
          //     concepto != "1"
          //       ? formatDate(form.getValues().dateDesde ?? new Date())
          //       : null,
          //   FchServHasta:
          //     concepto != "1"
          //       ? formatDate(form.getValues().dateHasta ?? new Date())
          //       : null,
          //   FchVtoPago:
          //     concepto != "1"
          //       ? formatDate(form.getValues().dateVencimiento ?? new Date())
          //       : null,
          //   ImpTotal:
          //     Math.round(
          //       100 * (Number(importe) * ivaFloat + Number(tributos))
          //     ) / 100,
          //   ImpTotConc: 0,
          //   ImpNeto: Number(importe),
          //   ImpOpEx: 0,
          //   ImpIVA:
          //     Math.round(
          //       100 * (Number(importe ?? 0) * ivaFloat - Number(importe))
          //     ) / 100,
          //   ImpTrib: 0,
          //   MonId: "PES",
          //   MonCotiz: 1,
          //   Iva: {
          //     Id: iva,
          //     BaseImp: Number(importe),
          //     Importe:
          //       Math.round(
          //         100 * (Number(importe ?? 0) * ivaFloat - Number(importe))
          //       ) / 100,
          //   },
          // };
          // const event = createEventFamily({
          //   family_group_id: grupoFamiliarId,
          //   type: "FC",
          //   amount: comprobante[0]?.importe ?? 0,
          //   comprobante_id: comprobante[0]?.id ?? "",
          // });
        } else if (tipoComprobante == "0") {
          comprobante = await createComprobante({
            estado: "pendiente",
            billLink: "", //deberiamos poner un link ?
            concepto: Number(concepto) ?? 0,
            importe: Number(subTotal) * ivaFloat + Number(tributos),
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
            health_insurance_id: obraSocialId,
          });
          const comprobanteId = comprobante[0]?.id ?? "";
          otherConceptsForm
            .getValues()
            .otherConcepts.forEach(async (concept) => {
              if (concept.importe > 0) {
                await createItem({
                  amount: concept.importe,
                  concept: concept.description,
                  iva: 0,
                  total: concept.importe,
                  comprobante_id: comprobanteId,
                });
              }
            });
          const sumaTributos = otherTributesForm
            .getValues()
            .tributes.reduce((acc, tribute) => acc + Number(tribute.amount), 0);
          if (sumaTributos > 0) {
            const tributo = await createItem({
              amount: sumaTributos,
              concept: "Tributos",
              iva: 0,
              total: sumaTributos,
              comprobante_id: comprobanteId,
            });
          }
          // const event = createEventFamily({
          //   family_group_id: grupoFamiliarId,
          //   type: "REC",
          //   amount: comprobante[0]?.importe ?? 0,
          //   comprobante_id: comprobante[0]?.id ?? "",
          // });
          // const eventOrg = createEventOrg({
          //   type: "REC",
          //   amount: comprobante[0]?.importe ?? 0,
          //   comprobante_id: comprobante[0]?.id ?? "",
          // });
        } else if (
          fcSeleccionada &&
          (tipoComprobante == "3" || tipoComprobante == "8")
        ) {
          const facSeleccionada = comprobantes?.find(
            (x) => x.id == fcSeleccionada[0]?.id
          );

          let ivaFloat = (100 + parseFloat(facSeleccionada?.iva ?? "0")) / 100;
          const importeBase = (facSeleccionada?.importe ?? 0) / ivaFloat;
          comprobante = await createComprobante({
            estado: "pendiente",
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
            health_insurance_id: obraSocialId,
          });

          const comprobanteId = comprobante[0]?.id ?? "";
          await createItem({
            amount: importeBase,
            concept: "Factura a cancelar",
            iva: importeBase * (ivaFloat - 1),
            total: facSeleccionada?.importe,
            comprobante_id: comprobanteId,
          });

          const sumaTributos = otherTributesForm
            .getValues()
            .tributes.reduce((acc, tribute) => acc + Number(tribute.amount), 0);
          if (sumaTributos > 0) {
            const tributo = await createItem({
              amount: sumaTributos,
              concept: "Tributos",
              iva: 0,
              total: sumaTributos,
              comprobante_id: comprobanteId,
            });
          }

          // try {
          //   last_voucher = await afip.ElectronicBilling.getLastVoucher(
          //     form.getValues().puntoVenta,
          //     tipoComprobante
          //   );
          // } catch {
          //   last_voucher = 0;
          // }

          // data = {
          //   CantReg: 1, // Cantidad de comprobantes a registrar
          //   PtoVta: comprobante[0]?.ptoVenta,
          //   CbteTipo: Number(tipoComprobante),
          //   Concepto: Number(comprobante[0]?.concepto),
          //   DocTipo: Number(comprobante[0]?.tipoDocumento),
          //   DocNro: comprobante[0]?.nroDocumento ?? "0",
          //   CbteDesde: last_voucher + 1,
          //   CbteHasta: last_voucher + 1,
          //   CbteFch: parseInt(fecha?.replace(/-/g, "") ?? ""),
          //   FchServDesde:
          //     concepto != "1"
          //       ? formatDate(comprobante[0]?.fromPeriod ?? new Date())
          //       : null,
          //   FchServHasta:
          //     concepto != "1"
          //       ? formatDate(comprobante[0]?.toPeriod ?? new Date())
          //       : null,
          //   FchVtoPago:
          //     concepto != "1"
          //       ? formatDate(comprobante[0]?.due_date ?? new Date())
          //       : null,
          //   ImpTotal: comprobante[0]?.importe,
          //   ImpTotConc: 0,
          //   ImpNeto:
          //     (Number(comprobante[0]?.importe) / ivaFloat).toFixed(2) ?? "0",
          //   ImpOpEx: 0,
          //   ImpIVA:
          //     Math.round(
          //       100 *
          //         ((comprobante[0]?.importe ?? 0) -
          //           Number(comprobante[0]?.importe) / ivaFloat)
          //     ) / 100,

          //   ImpTrib: 0,
          //   MonId: "PES",
          //   MonCotiz: 1,
          //   Iva: {
          //     Id: reversedIvaDictionary[comprobante[0]?.iva ?? "0"],
          //     BaseImp: (Number(comprobante[0]?.importe) / ivaFloat).toFixed(2),
          //     Importe:
          //       Math.round(
          //         100 *
          //           ((comprobante[0]?.importe ?? 0) -
          //             parseFloat(
          //               (Number(comprobante[0]?.importe) / ivaFloat).toFixed(2)
          //             ))
          //       ) / 100,
          //   },
          //   CbtesAsoc: {
          //     Tipo: comprobanteDictionary[
          //       facSeleccionada?.tipoComprobante ?? ""
          //     ],
          //     PtoVta: facSeleccionada?.ptoVenta ?? 1,
          //     Nro: facSeleccionada?.nroComprobante ?? 0,
          //   },
          // };
          // const event = createEventFamily({
          //   family_group_id: grupoFamiliarId,
          //   type: "NC",
          //   amount: comprobante[0]?.importe ?? 0,
          //   comprobante_id: comprobante[0]?.id ?? "",
          // });
        } else {
          toast.error("Error, revise que todos los campos esten completos");
          return null;
        }

        console.log("testtt2");

        if (comprobante && comprobante[0]) {
          setCreatedComprobante(comprobante[0]);
        }
        setLoading(false);
        setPage("confirmationPage");
      })();
    } catch {
      setLoading(false);
      toast.error("Error");
    }
  }

  const [tipoComprobante, setTipoComprobante] = useState("");
  // const [concepto, setConcepto] = useState("");
  const [createdComprobante, setCreatedComprobante] = useState<Comprobante>();
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [ivaCondition, setIvaCondition] = useState("");
  const [sellCondition, setSellCondition] = useState("");
  const [nroDocumento, setNroDocumento] = useState("");
  const [nroDocumentoDNI, setNroDocumentoDNI] = useState("");
  const [nombre, setNombre] = useState("");
  const [tributos, setTributos] = useState("0");
  const [servicioprod, setservicioprod] = useState("Servicio");
  const [obraSocialId, setObraSocialId] = useState("");
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
      facturasEmitidas: {
        tipoComprobante: "",
        puntoVenta: "",
        nroComprobante: "",
        importe: 0,
        iva: "",
      },
    },
  });

  const conceptsForm = useForm<ConceptsForm>({
    defaultValues: {
      concepts: [{ concepto: "", importe: 0, iva: 0, total: 0 }],
    },
  });

  const otherTributesForm = useForm<OtherTributesForm>({
    defaultValues: {
      tributes: [
        { tribute: "", jurisdiccion: "", base: 0, aliquot: 0, amount: 0 },
      ],
    },
  });
  console.log("comprobante tipo", valueToNameComprobanteMap[tipoComprobante]);
  const asociatedFCForm = useForm<AsociatedFCForm>({
    defaultValues: {
      comprobantes: [
        {
          tipoComprobante: "",
          puntoVenta: "",
          nroComprobante: "",
          dateEmision: new Date(),
          importe: 0,
          iva: 0,
        },
      ],
    },
  });

  const otherConceptsForm = useForm<otherConceptsForm>({
    defaultValues: { otherConcepts: [{ description: "", importe: 0 }] },
  });

  const [brandId, setBrandId] = useState("");
  const [page, setPage] = useState<"formPage" | "confirmationPage">("formPage");

  function handlePageChange(page: "formPage" | "confirmationPage") {
    setPage(page);
  }

  function handleGrupoFamilarChange(value: string) {
    setGrupoFamiliarId(value);
    setObraSocialId("");
    let grupo = gruposFamiliar?.find((x: { id: string }) => x.id == value);
    let billResponsible = grupo?.integrants.find(
      (x: { isBillResponsible: any }) => x.isBillResponsible
    );
    setComprobantes(grupo?.comprobantes ?? []);
    setNroDocumento(billResponsible?.fiscal_id_number ?? "0");
    setNroDocumentoDNI(billResponsible?.id_number ?? "0");
    setNombre(billResponsible?.name ?? "");
    setTipoDocumento(billResponsible?.fiscal_id_type ?? "");
    setBrandId(grupo?.businessUnitData?.brandId ?? "");
    setIvaCondition(billResponsible?.afip_status ?? "");
    setSellCondition(grupo?.sale_condition ?? "");
  }
  function handleObraSocialChange(value: string) {
    setGrupoFamiliarId("");
    setObraSocialId(value);
    let obra = obrasSociales?.find((x: { id: string }) => x.id == value);
    console.log("obra?.comprobantes");
    console.log(obra?.comprobantes ?? []);
    setComprobantes(obra?.comprobantes ?? []);
    setNroDocumento(obra?.fiscal_id_number?.toString() ?? "0");
    setNroDocumentoDNI("0");
    setNombre(obra?.responsibleName ?? "");
    setTipoDocumento(obra?.fiscal_id_type ?? "");
    setIvaCondition(obra?.afip_status ?? "");
    setSellCondition("No Aplica");
  }

  function handleComprobanteChange(value: string) {
    setFCSelec(value);
    setSelectedComprobante(comprobantes?.find((x) => x.id == value));
  }

  let selectedBrand;

  const handleBrandChange = (value: string) => {
    selectedBrand = marcas?.find((marca: { id: string }) => marca.id === value);
    setBrandId(value);
  };

  const reloadPage = () => {
    setSubTotal(0);
    setIvaTotal(0);
    setOtherAttributes(0);
    setLogo("");
    setFCSelec("");
    setFcSeleccionada([]);
    setComprobantes(undefined);
    setSelectedComprobante(null);
    setTipoComprobante("");
    setCreatedComprobante(undefined);
    setTipoDocumento("");
    setIvaCondition("");
    setSellCondition("");
    setNroDocumento("");
    setNroDocumentoDNI("");
    setNombre("");
    setTributos("0");
    setservicioprod("Servicio");
    setObraSocialId("");
    setError(null);
    // setLoading(true);
    setGrupoFamiliarId("");
    form.reset();
    conceptsForm.reset();
    otherTributesForm.reset();
    asociatedFCForm.reset();
    otherConceptsForm.reset();
    setPage("formPage");
    setBrandId("");
    router.refresh();
  };

  if (!grupoFamiliarId && !obraSocialId) {
    return (
      <LayoutContainer>
        <section>
          <div>
            <Title>Generación de comprobantes</Title>
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
                  gruposFamiliar.map((gruposFamiliar: any) => (
                    <SelectItem
                      key={gruposFamiliar?.id}
                      value={gruposFamiliar?.id}
                      className="rounded-none"
                    >
                      {
                        gruposFamiliar?.integrants.find(
                          (x: { isHolder: any }) => x.isHolder
                        )?.name
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
                      {obrasSocial?.initials}
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
              {/* <div className="pb-2">
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
              </div> */}
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
                    gruposFamiliar.map((gruposFamiliar: any) => (
                      <SelectItem
                        key={gruposFamiliar?.id}
                        value={gruposFamiliar?.id}
                        className="rounded-none"
                      >
                        {
                          gruposFamiliar?.integrants.find(
                            (x: { isHolder: any }) => x.isHolder
                          )?.name
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
                    obrasSociales.map((obrasSocial: any) => (
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
              conditionIVA={ivaCondition}
              conditionVenta={sellCondition}
            />

            <ComprobanteCard
              onValueChange={computeTotals}
              comprobantesEntidad={comprobantesEntidad}
              visualization={false}
              form={form}
              tipoComprobante={tipoComprobante}
              setTipoComprobante={setTipoComprobante}
            />

            <AdditionalInfoCard
              possibleComprobanteTipo={
                fcAnc[
                  reverseComprobanteDictionary[
                    Number(tipoComprobante ?? "0")
                  ] ?? ""
                ] ?? ""
              }
              comprobantes={comprobantes}
              fcSeleccionada={fcSeleccionada}
              setFcSeleccionada={setFcSeleccionada}
              grupoFamiliarId={grupoFamiliarId}
              onValueChange={computeTotals}
              visualization={false}
              tipoComprobante={tipoComprobante}
              conceptsForm={conceptsForm}
              form={form}
              asociatedFCForm={asociatedFCForm}
              otherConceptsForm={otherConceptsForm}
            />

            <OtherTributes
              Visualization={false}
              otherTributes={otherTributesForm}
              onAdd={computeTotals}
            />

            <Totals
              subTotal={subTotal}
              iva={ivaTotal}
              otherAttributes={otherAttributes}
            />
            <Button
              variant="outline"
              className="flex justify-between px-4 py-4 rounded-full self-end bg-[#BEF0BB] hover:bg-[#BEF0BB] text-[#3e3e3e]"
              onClick={() => {
                generateComprobante();
              }}
            >
              Siguiente
              {loading ? (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              ) : (
                <CircleChevronRight className="h-4 ml-2" />
              )}
            </Button>
          </section>
        )}
        {page === "confirmationPage" && createdComprobante && (
          <ConfirmationPage
            form={form}
            reloadPage={reloadPage}
            fcSeleccionada={fcSeleccionada}
            setFcSeleccionada={setFcSeleccionada}
            conceptsForm={conceptsForm}
            otherConcepts={otherConceptsForm}
            setTipoComprobante={setTipoComprobante}
            tipoComprobante={tipoComprobante}
            asociatedFCForm={asociatedFCForm}
            otherTributes={otherTributesForm}
            changePage={handlePageChange}
            subTotal={subTotal}
            ivaTotal={ivaTotal}
            document={nroDocumentoDNI}
            fiscal_document={nroDocumento}
            name={nombre}
            ivaCondition={ivaCondition}
            sell_condition={sellCondition}
            afip={afip}
            document_type={tipoDocumento}
            otherAttributes={otherAttributes}
            fgId={grupoFamiliarId}
            osId={obraSocialId}
            brandId={brandId}
            company={company}
            gruposFamiliar={gruposFamiliar}
            obrasSociales={obrasSociales}
            marcas={marcas}
            createdComprobante={createdComprobante}
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
