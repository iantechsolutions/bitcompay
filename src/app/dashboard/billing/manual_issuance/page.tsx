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
import { useRouter } from "next/router";
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
    api.comprobantes.addBillLink.useMutation();
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
  const [comprobantes, setComprobantes] = useState<any[]>([]);
  const [selectedComprobante, setSelectedComprobante] = useState<any>(null);
  const [comprobanteCreado, setComprobanteCreado] = useState<any>(null);
  const [afip, setAfip] = useState<any>(null);
  useEffect(() => {
    async function loginAfip() {
      const afip = await ingresarAfip();
      console.log("afip loaded");
      setAfip(afip);
    }

    loginAfip();
  }, []);

  // async function handlePrevisualize() {
  //   console.log("arranca");
  //   let comprobanteAhora = null;
  //   if (!comprobanteCreado) {
  //     console.log("empieza a crear");
  //     if (marcas) {
  //       setLogo(marcas[0]!.logo_url!);
  //     }
  //     setLoading(true);
  //     let comprobante = null;
  //     const fecha = new Date(
  //       Date.now() - new Date().getTimezoneOffset() * 60000
  //     )
  //       .toISOString()
  //       .split("T")[0];
  //     console.log("se define por tipoComprobante", tipoComprobante);
  //     if (fcSelec && (tipoComprobante == "2" || tipoComprobante == "12")) {
  //       const facSeleccionada = comprobantes?.find((x) => x.id == fcSelec);
  //       let ivaFloat = (100 + parseFloat(facSeleccionada?.iva ?? "0")) / 100;
  //       comprobante = await createComprobante({
  //         billLink: "",
  //         concepto: facSeleccionada?.concepto ?? 0,
  //         importe: facSeleccionada?.importe ?? 0,
  //         iva: facSeleccionada?.iva ?? "0",
  //         nroDocumento: facSeleccionada?.nroDocumento ?? 0,
  //         ptoVenta: facSeleccionada?.ptoVenta ?? 0,
  //         tipoDocumento: facSeleccionada?.tipoDocumento ?? 0,
  //         tipoComprobante: reverseComprobanteDictionary[tipoComprobante],
  //         fromPeriod: facSeleccionada?.fromPeriod,
  //         toPeriod: facSeleccionada?.toPeriod,
  //         due_date: facSeleccionada?.due_date,
  //         generated: new Date(),
  //         prodName: facSeleccionada?.prodName ?? "",
  //         nroComprobante: facSeleccionada?.nroComprobante ?? 0,
  //         family_group_id: grupoFamiliarId,
  //       });
  //       setComprobanteCreado(comprobante[0]);
  //       const event = createEventFamily({
  //         family_group_id: grupoFamiliarId,
  //         type: "NC",
  //         amount: comprobante[0]?.importe ?? 0,
  //       });
  //     } else if (tipoComprobante == "3" || tipoComprobante == "6") {
  //       let ivaFloat =
  //         (100 + parseFloat(ivaDictionary[Number(iva)] ?? "0")) / 100;
  //       comprobante = await createComprobante({
  //         billLink: "",
  //         concepto: Number(concepto) ?? 0,
  //         importe: Number(importe) ?? 0,
  //         iva: iva ?? "0",
  //         nroDocumento: Number(nroDocumento) ?? 0,
  //         ptoVenta: Number(puntoVenta) ?? 0,
  //         tipoDocumento: idDictionary[tipoDocumento ?? ""] ?? 0,
  //         tipoComprobante: reverseComprobanteDictionary[tipoComprobante],
  //         fromPeriod: dateDesde,
  //         toPeriod: dateHasta,
  //         due_date: dateVencimiento,
  //         generated: new Date(),
  //         prodName: servicioprod ?? "",
  //         nroComprobante: 0,
  //         family_group_id: grupoFamiliarId,
  //       });
  //       setComprobanteCreado(comprobante[0]);
  //       const event = createEventFamily({
  //         family_group_id: grupoFamiliarId,
  //         type: "FC",
  //         amount: comprobante[0]?.importe ?? 0,
  //       });
  //     } else if (tipoComprobante == "0") {
  //       comprobante = await createComprobante({
  //         billLink: "",
  //         concepto: Number(concepto) ?? 0,
  //         importe: Number(importe) ?? 0,
  //         iva: "0",
  //         nroDocumento: Number(nroDocumento) ?? 0,
  //         ptoVenta: Number(puntoVenta) ?? 0,
  //         tipoDocumento: idDictionary[tipoDocumento ?? ""] ?? 0,
  //         tipoComprobante: reverseComprobanteDictionary[tipoComprobante],
  //         fromPeriod: dateDesde,
  //         toPeriod: dateHasta,
  //         due_date: dateVencimiento,
  //         generated: new Date(),
  //         prodName: servicioprod ?? "",
  //         nroComprobante: 0,
  //         family_group_id: grupoFamiliarId,
  //       });
  //       setComprobanteCreado(comprobante[0]);
  //       const event = createEventFamily({
  //         family_group_id: grupoFamiliarId,
  //         type: "REC",
  //         amount: comprobante[0]?.importe ?? 0,
  //       });
  //       const eventOrg = createEventOrg({
  //         type: "REC",
  //         amount: comprobante[0]?.importe ?? 0,
  //       });
  //     }
  //     comprobanteAhora = comprobante ? comprobante[0] : null;
  //     console.log("hecho");
  //     setLoading(false);
  //     // toast.success("La factura se creo correctamente");
  //   }
  //   console.log("billLink if");
  //   if (comprobanteAhora || !comprobanteCreado?.billLink) {
  //     console.log("creacion link");
  //     const billResponsible = gruposFamiliar
  //       ?.find((x) => x.id == grupoFamiliarId)
  //       ?.integrants.find((x) => x.isBillResponsible);
  //     const obraSocial = obrasSociales?.find((x) => x.id == obraSocialId);
  //     console.log("html");
  //     const html = htmlBill(
  //       comprobanteCreado,
  //       company,
  //       undefined,
  //       2,
  //       marcas?.find((x) => x.id === brandId),
  //       nombre,
  //       billResponsible
  //         ? billResponsible?.address ??
  //             "" + " " + (billResponsible?.address_number ?? "")
  //         : obraSocial?.adress ?? "",
  //       (billResponsible ? billResponsible?.locality : obraSocial?.locality) ??
  //         "",
  //       (billResponsible ? billResponsible?.province : obraSocial?.province) ??
  //         "",
  //       (billResponsible
  //         ? billResponsible?.postal_code?.cp
  //         : obraSocial?.postal_code) ?? "",
  //       (billResponsible
  //         ? billResponsible?.fiscal_id_type
  //         : obraSocial?.fiscal_id_type) ?? "",
  //       (billResponsible
  //         ? billResponsible?.fiscal_id_number
  //         : obraSocial?.fiscal_id_number?.toString()) ?? "",
  //       (billResponsible
  //         ? billResponsible?.afip_status
  //         : obraSocial?.afip_status) ?? ""
  //     );
  //     const options = {
  //       width: 8, // Ancho de pagina en pulgadas. Usar 3.1 para ticket
  //       marginLeft: 0.8, // Margen izquierdo en pulgadas. Usar 0.1 para ticket
  //       marginRight: 0.8, // Margen derecho en pulgadas. Usar 0.1 para ticket
  //       marginTop: 0.4, // Margen superior en pulgadas. Usar 0.1 para ticket
  //       marginBottom: 0.4, // Margen inferior en pulgadas. Usar 0.1 para ticket
  //     };
  //     const name = "DEMO.pdf";
  //     console.log("subiendo");
  //     const resHtml = await afip.ElectronicBilling.createPDF({
  //       html: html,
  //       file_name: name,
  //       options: options,
  //     });
  //     console.log("resHtml", resHtml);
  //     const updatedComprobante = await updateComprobante({
  //       id: comprobanteCreado?.id ?? "",
  //       billLink: resHtml.file,
  //     });
  //     setComprobanteCreado(updatedComprobante);
  //   }
  //   console.log("aca hay window");
  //   console.log(comprobanteAhora);
  //   console.log(comprobanteCreado);
  //   if (comprobanteAhora && comprobanteAhora?.billLink) {
  //     window.open(comprobanteAhora?.billLink, "_blank");
  //   } else {
  //     window.open(comprobanteCreado.billLink, "_blank");
  //   }
  // }

  function generateComprobante() {
    if (marcas) {
      setLogo(marcas[0]!.logo_url!);
    }
    try {
      (async () => {
        setLoading(true);
        const afip = await ingresarAfip();
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

        if (fcSelec && (tipoComprobante == "2" || tipoComprobante == "12")) {
          const facSeleccionada = comprobantes?.find((x) => x.id == fcSelec);

          let ivaFloat = (100 + parseFloat(facSeleccionada?.iva ?? "0")) / 100;

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
          });
          try {
            last_voucher = await afip.ElectronicBilling.getLastVoucher(
              puntoVenta,
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
            DocNro: comprobante[0]?.nroDocumento,
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
            ImpNeto: (Number(comprobante[0]?.importe) / ivaFloat).toFixed(2),
            ImpOpEx: 0,
            ImpIVA:
              Math.round(
                100 *
                  (comprobante[0]?.importe ??
                    0 -
                      parseFloat(
                        (Number(comprobante[0]?.importe) / ivaFloat).toFixed(2)
                      ))
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
                    (comprobante[0]?.importe ??
                      0 -
                        parseFloat(
                          (Number(comprobante[0]?.importe) / ivaFloat).toFixed(
                            2
                          )
                        ))
                ) / 100,
            },
            CbtesAsoc: {
              Tipo: comprobanteDictionary[
                facSeleccionada?.tipoComprobante ?? ""
              ],
              BaseImp: (facSeleccionada?.importe ?? 0) / ivaFloat,
              Importe: (facSeleccionada?.importe ?? 0) * (1 - ivaFloat),
            },
          };
          const event = createEventFamily({
            family_group_id: grupoFamiliarId,
            type: "NC",
            amount: comprobante[0]?.importe ?? 0,
          });
        } else if (tipoComprobante == "3" || tipoComprobante == "6") {
          let ivaFloat =
            (100 + parseFloat(ivaDictionary[Number(iva)] ?? "0")) / 100;
          // const billResponsible = gruposFamiliar
          //   ?.find((x) => x.id == grupoFamiliarId)
          //   ?.integrants.find((x) => x.isBillResponsible);
          comprobante = await createComprobante({
            billLink: "",
            concepto: Number(concepto) ?? 0,
            importe: Number(importe) ?? 0,
            iva: iva ?? "0",
            nroDocumento: Number(nroDocumento) ?? 0,
            ptoVenta: Number(puntoVenta) ?? 0,
            tipoDocumento: idDictionary[tipoDocumento ?? ""] ?? 0,
            tipoComprobante: reverseComprobanteDictionary[tipoComprobante],
            fromPeriod: dateDesde,
            toPeriod: dateHasta,
            due_date: dateVencimiento,
            generated: new Date(),
            prodName: servicioprod ?? "",
            nroComprobante: 0,
            family_group_id: grupoFamiliarId,
          });
          try {
            last_voucher = await afip.ElectronicBilling.getLastVoucher(
              puntoVenta,
              tipoComprobante
            );
          } catch {
            last_voucher = 0;
          }
          data = {
            CantReg: 1, // Cantidad de comprobantes a registrar
            PtoVta: Number(puntoVenta),
            CbteTipo: Number(tipoComprobante),
            Concepto: Number(concepto),
            DocTipo: idDictionary[tipoDocumento ?? ""],
            DocNro: nroDocumento ?? 0,
            CbteDesde: last_voucher + 1,
            CbteHasta: last_voucher + 1,
            CbteFch: parseInt(fecha?.replace(/-/g, "") ?? ""),
            FchServDesde:
              concepto != "1" ? formatDate(dateDesde ?? new Date()) : null,
            FchServHasta:
              concepto != "1" ? formatDate(dateHasta ?? new Date()) : null,
            FchVtoPago:
              concepto != "1"
                ? formatDate(dateVencimiento ?? new Date())
                : null,
            ImpTotal: Number(importe),
            ImpTotConc: 0,
            ImpNeto: (Number(importe) / ivaFloat).toFixed(2),
            ImpOpEx: 0,
            ImpIVA:
              Math.round(
                100 *
                  (Number(importe ?? 0) -
                    parseFloat((Number(importe) / ivaFloat).toFixed(2)))
              ) / 100,
            ImpTrib: 0,
            MonId: "PES",
            MonCotiz: 1,
            Iva: {
              Id: iva,
              BaseImp: (Number(importe) / ivaFloat).toFixed(2),
              Importe:
                Math.round(
                  100 *
                    (Number(importe ?? 0) -
                      parseFloat((Number(importe) / ivaFloat).toFixed(2)))
                ) / 100,
            },
          };
          const event = createEventFamily({
            family_group_id: grupoFamiliarId,
            type: "FC",
            amount: comprobante[0]?.importe ?? 0,
          });
        } else if (tipoComprobante == "0") {
          // iva = 0;

          //
          comprobante = await createComprobante({
            billLink: "",
            concepto: Number(concepto) ?? 0,
            importe: Number(importe) ?? 0,
            iva: "0",
            nroDocumento: Number(nroDocumento) ?? 0,
            ptoVenta: Number(puntoVenta) ?? 0,
            tipoDocumento: idDictionary[tipoDocumento ?? ""] ?? 0,
            tipoComprobante: reverseComprobanteDictionary[tipoComprobante],
            fromPeriod: dateDesde,
            toPeriod: dateHasta,
            due_date: dateVencimiento,
            generated: new Date(),
            prodName: servicioprod ?? "",
            nroComprobante: 0,
            family_group_id: grupoFamiliarId,
          });
          const event = createEventFamily({
            family_group_id: grupoFamiliarId,
            type: "REC",
            amount: comprobante[0]?.importe ?? 0,
          });
          const eventOrg = createEventOrg({
            type: "REC",
            amount: comprobante[0]?.importe ?? 0,
          });
        }

        if (data) {
          const res = await afip.ElectronicBilling.createVoucher(data);
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
              : obraSocial?.postal_code) ?? "",
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
          });
          console.log("resultadHTML", resHtml);
        }
        setLoading(false);
        toast.success("La factura se creo correctamente");
      })();
    } catch {
      toast.error("Error");
    }
  }

  type Channel = {
    number: number;
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    createdAt: Date;
    updatedAt: Date | null;
    requiredColumns: string[];
  };

  const [puntoVenta, setPuntoVenta] = useState("");
  const [tipoComprobante, setTipoComprobante] = useState("");
  const [concepto, setConcepto] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [nroDocumento, setNroDocumento] = useState("");
  const [nroDocumentoDNI, setNroDocumentoDNI] = useState("");
  const [nombre, setNombre] = useState("");
  const [importe, setImporte] = useState("0");
  const [tributos, setTributos] = useState("0");
  const [dateDesde, setDateDesde] = React.useState<Date>();
  const [dateHasta, setDateHasta] = React.useState<Date>();
  const [dateVencimiento, setDateVencimiento] = React.useState<Date>();
  const [dateEmision, setDateEmision] = React.useState<Date>();
  const [servicioprod, setservicioprod] = useState("Servicio");
  const [obraSocialId, setObraSocialId] = useState("");
  const [iva, setIva] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [grupoFamiliarId, setGrupoFamiliarId] = useState("");

  const products = api.products.list.useQuery().data;
  const [brandId, setBrandId] = useState("");
  function handleGrupoFamilarChange(value: string) {
    setGrupoFamiliarId(value);
    setObraSocialId("");
    let grupo = gruposFamiliar?.find((x) => x.id == value);
    let billResponsible = grupo?.integrants.find((x) => x.isBillResponsible);
    setComprobantes(grupo?.comprobantes ?? []);
    setNroDocumento(billResponsible?.fiscal_id_number ?? "");
    setNroDocumentoDNI(billResponsible?.id_number ?? "");
    setNombre(billResponsible?.name ?? "");
    setTipoDocumento(billResponsible?.fiscal_id_type ?? "");
    setBrandId(grupo?.businessUnitData?.brandId ?? "");
  }
  function handleObraSocialChange(value: string) {
    setGrupoFamiliarId("");
    setObraSocialId(value);
    let obra = obrasSociales?.find((x) => x.id == value);
    setNroDocumento(obra?.fiscal_id_number?.toString() ?? "");
    setNroDocumentoDNI("0" ?? "");
    setNombre(obra?.responsibleName ?? "");
    setTipoDocumento(obra?.fiscal_id_type ?? "");
    // setTipoDocumento(billResponsible?.fiscal_id_type ?? "");
    // setBrandId(obra?.businessUnitData?.brandId ?? "");
  }
  function handleComprobanteChange(value: string) {
    setFCSelec(value);
    setSelectedComprobante(comprobantes?.find((x) => x.id == value));
  }
  let selectedBrand;

  const [popoverDesdeOpen, setPopoverDesdeOpen] = useState(false);
  const [popoverFinOpen, setPopoverFinOpen] = useState(false);
  const [popoverVencimientoOpen, setPopoverVencimientoOpen] = useState(false);
  const [popoverEmisionOpen, setPopoverEmisionOpen] = useState(false);

  async function FechasCreateDesde(e: any) {
    setDateDesde(e);
    setPopoverDesdeOpen(false);
  }
  async function FechasCreateFin(e: any) {
    setDateHasta(e);
    setPopoverFinOpen(false);
  }
  async function FechasCreateVencimiento(e: any) {
    setDateVencimiento(e);
    setPopoverVencimientoOpen(false);
  }
  async function FechasCreateEmision(e: any) {
    setDateEmision(e);
    setPopoverEmisionOpen(false);
  }

  const handleBrandChange = (value: string) => {
    selectedBrand = marcas?.find((marca) => marca.id === value);
    setBrandId(value);
  };

  return (
    <>
      <LayoutContainer>
        <section className="space-y-2">
          <div>
            <Title>Generación de comprobantes</Title>
          </div>
          <div className="flex flex-row justify-between border-[#0DA485] border-b-2">
            <p className=" text-lg">Receptor</p>
            <div className="pb-2">
              <Button
                className="h-7 bg-[#0DA485] hover:bg-[#0da486e2] text-[#FAFDFD] font-medium-medium text-xs rounded-2xl py-0 px-6 mr-3"
                // onClick={() => setOpen(true)}
                onClick={generateComprobante}
              >
                Aprobar
                <CircleCheck className="h-4 w-auto ml-2" />
              </Button>
              <Button
                className="  h-7 bg-[#D9D7D8] hover:bg-[#d9d7d8dc] text-[#4B4B4B]  text-xs rounded-2xl py-0 px-6 "
                // onClick={() => setOpen(true)}
              >
                Anular
                <CircleX className="h-4 w-auto ml-2" />
              </Button>
            </div>
          </div>
          <div className="flex flex-row justify-between gap-8">
            <Select
              onValueChange={(e) => handleGrupoFamilarChange(e)}
              value={grupoFamiliarId}
            >
              <SelectTriggerMagnify className=" font-bold w-full">
                <SelectValue placeholder="Buscar afiliado" />
              </SelectTriggerMagnify>
              <SelectContent>
                {gruposFamiliar &&
                  gruposFamiliar.map((gruposFamiliar) => (
                    <SelectItem
                      key={gruposFamiliar?.id}
                      value={gruposFamiliar?.id}
                      className="rounded-none border-b border-gray-600"
                    >
                      {gruposFamiliar?.numericalId}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-lg font-bold mt-1"> O </p>
            <Select
              onValueChange={(e) => handleObraSocialChange(e)}
              value={obraSocialId}
            >
              <SelectTriggerMagnify className="w-full font-bold">
                <SelectValue placeholder="Buscar obra social" />
              </SelectTriggerMagnify>
              <SelectContent>
                {obrasSociales &&
                  obrasSociales.map((obrasSocial) => (
                    <SelectItem
                      key={obrasSocial?.id}
                      value={obrasSocial?.id}
                      className="rounded-none border-b border-gray-600"
                    >
                      {obrasSocial?.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="bg-[#e9fcf8] rounded-lg p-4 flex flex-row justify-between">
            <div className="flex flex-col gap-2">
              <Label>NOMBRE RESPONSABLE</Label>
              <Input
                disabled={true}
                value={nombre}
                className="bg-white w-72 opacity-100 border-[#0DA485] border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>DNI</Label>
              <Input
                disabled={true}
                value={nroDocumentoDNI}
                className="bg-white w-72 opacity-100 border-[#0DA485] border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>CUIT</Label>
              <Input
                disabled={true}
                value={nroDocumento}
                className="bg-white w-72 opacity-100 border-[#0DA485] border"
              />
            </div>
          </div>

          <div className="flex flex-row justify-between border-[#0DA485] border-b-2">
            <p className=" text-lg">Datos del Comprobante</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Punto de venta</Label>
              <br />
              <Select onValueChange={(e) => setPuntoVenta(e)}>
                <SelectTrigger className="font-bold border-[#0DA485] border">
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
                      className="rounded-none border-b border-gray-600"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="emition">Fecha de emisión</Label>
              <br />
              <Popover
                open={popoverEmisionOpen}
                onOpenChange={setPopoverEmisionOpen}
              >
                <PopoverTrigger asChild={true}>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal border-[#0DA485] border w-full",
                      !dateEmision && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateEmision ? (
                      format(dateEmision, "PPP")
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateEmision}
                    onSelect={(e) => FechasCreateEmision(e)}
                    initialFocus={true}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="factura">Tipo Comprobante</Label>
              <br />
              <Select onValueChange={(e) => setTipoComprobante(e)}>
                <SelectTrigger className="font-bold border-[#0DA485] border">
                  <SelectValue placeholder="Seleccionar comprobante..." />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: "3", label: "FACTURA A" },
                    { value: "6", label: "FACTURA B" },
                    { value: "2", label: "NOTA DE CREDITO A" },
                    { value: "12", label: "NOTA DE CREDITO B" },
                    { value: "0", label: "RECIBO" },
                  ].map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="rounded-none border-b border-gray-600"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="iva">Alicuota</Label>
              <br />
              <Select onValueChange={(e) => setIva(e)}>
                <SelectTrigger className="font-bold border-[#0DA485] border">
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
                      className="rounded-none border-b border-gray-600"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="concepto">Tipo de concepto</Label>
              <br />
              <Select onValueChange={(e) => setConcepto(e)}>
                <SelectTrigger className="font-bold border-[#0DA485] border">
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
                      className="rounded-none border-b border-gray-600"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="emition">Fecha de vencimiento</Label>
              <br />
              <Popover
                open={popoverVencimientoOpen}
                onOpenChange={setPopoverVencimientoOpen}
              >
                <PopoverTrigger asChild={true}>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "justify-start text-left font-normal border-[#0DA485] border w-full",
                      !dateVencimiento && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateVencimiento ? (
                      format(dateVencimiento, "PPP")
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateVencimiento}
                    onSelect={(e) => FechasCreateVencimiento(e)}
                    initialFocus={true}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="emition">Fecha inicio de servicio</Label>
              <br />
              <Popover
                open={popoverDesdeOpen}
                onOpenChange={setPopoverDesdeOpen}
              >
                <PopoverTrigger asChild={true}>
                  <Button
                    variant={"outline"}
                    disabled={concepto != "1"}
                    className={cn(
                      "justify-start text-left font-normal border-[#0DA485] border w-full",
                      !dateDesde && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateDesde ? (
                      format(dateDesde, "PPP")
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateDesde}
                    onSelect={(e) => FechasCreateDesde(e)}
                    initialFocus={true}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="emition">Fecha fin de servicio</Label>
              <br />
              <Popover
                open={popoverFinOpen}
                onOpenChange={setPopoverVencimientoOpen}
              >
                <PopoverTrigger asChild={true}>
                  <Button
                    variant={"outline"}
                    disabled={concepto != "1"}
                    className={cn(
                      "justify-start text-left font-normal border-[#0DA485] border w-full",
                      !dateHasta && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateHasta ? (
                      format(dateHasta, "PPP")
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateHasta}
                    onSelect={(e) => FechasCreateFin(e)}
                    initialFocus={true}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex flex-row justify-between border-[#0DA485] border-b-2">
            <p className=" text-lg">Datos del Comprobante Asociado</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="factura">Comprobante Asociado</Label>
              <br />
              <Select
                onValueChange={(e) => handleComprobanteChange(e)}
                disabled={tipoComprobante != "2" && tipoComprobante != "12"}
              >
                <SelectTrigger className="font-bold border-[#0DA485] border">
                  <SelectValue placeholder="Seleccionar comprobante..." />
                </SelectTrigger>
                <SelectContent>
                  {gruposFamiliar?.find((x) => x.id == grupoFamiliarId) &&
                    gruposFamiliar
                      ?.find((x) => x.id == grupoFamiliarId)
                      ?.comprobantes.filter(
                        (x) =>
                          x.estado != "generada" &&
                          x.ptoVenta.toString() === puntoVenta
                      )
                      .map((comprobante) => (
                        <SelectItem
                          key={comprobante?.id}
                          value={comprobante?.id}
                          className="rounded-none border-b border-gray-600"
                        >
                          {comprobante?.nroComprobante}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
            <div></div>
            <div className="bg-[#e9fcf8] rounded-lg p-4 flex flex-row justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Label>Punto de venta</Label>
                <Input
                  disabled={true}
                  value={selectedComprobante ? puntoVenta : "-"}
                  className="bg-white opacity-100 border-[#0DA485] border"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Nro factura</Label>
                <Input
                  disabled={true}
                  value={
                    selectedComprobante
                      ? selectedComprobante.nroComprobante
                      : "-"
                  }
                  className="bg-white opacity-100 border-[#0DA485] border"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Fecha emision</Label>
                <Input
                  disabled={true}
                  value={
                    selectedComprobante
                      ? dateNormalFormat(selectedComprobante.createdAt)
                      : "-"
                  }
                  className="bg-white opacity-100 border-[#0DA485] border"
                />
              </div>
            </div>

            <div className="bg-[#e9fcf8] rounded-lg p-4 flex flex-row justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Label>Desde</Label>
                <Input
                  disabled={true}
                  value={
                    selectedComprobante
                      ? dateNormalFormat(selectedComprobante.fromPeriod)
                      : "-"
                  }
                  className="bg-white opacity-100 border-[#0DA485] border"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Hasta</Label>
                <Input
                  disabled={true}
                  value={
                    selectedComprobante
                      ? dateNormalFormat(selectedComprobante.toPeriod)
                      : "-"
                  }
                  className="bg-white opacity-100 border-[#0DA485] border"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Concepto</Label>
                <Input
                  disabled={true}
                  value={
                    selectedComprobante
                      ? reverseConceptDictionary[selectedComprobante.concepto]
                      : "-"
                  }
                  className="bg-white opacity-100 border-[#0DA485] border"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Importe</Label>
                <Input
                  disabled={true}
                  value={
                    selectedComprobante ? selectedComprobante.importe : "-"
                  }
                  className="bg-white opacity-100 border-[#0DA485] border"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-row justify-between border-[#0DA485] border-b-2">
            <p className=" text-lg">Totales</p>
          </div>
          <div className="flex flex-row justify-between pb-2">
            <div className="flex flex-col gap-2">
              <Label>Sub-total factura</Label>
              <Input
                // disabled={true}
                value={"$ " + importe}
                onChange={(e) => setImporte(e.target.value.slice(2))}
                className="bg-[#e9fcf8] text-[#0DA485] rounded-none opacity-100 border-[#e9fcf8] border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Importe IVA</Label>
              <Input
                // disabled={true}
                value={
                  "$ " +
                  (
                    (Number(importe) * Number(ivaDictionary[Number(iva)])) /
                    100
                  ).toFixed(2)
                }
                className="bg-[#e9fcf8] text-[#0DA485] rounded-none opacity-100 border-[#e9fcf8] border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Otros tributos</Label>
              <Input
                // disabled={true}
                value={"$ " + tributos}
                onChange={(e) => setTributos(e.target.value.slice(2))}
                className="bg-[#e9fcf8] text-[#0DA485] rounded-none opacity-100 border-[#e9fcf8] border"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Total</Label>
              <Input
                // disabled={true}
                value={
                  "$ " +
                  (
                    Number(importe) +
                    (Number(importe) * Number(ivaDictionary[Number(iva)])) /
                      100 +
                    Number(tributos)
                  ).toFixed(2)
                }
                className="bg-[#e9fcf8] text-[#0DA485] rounded-none  opacity-100 border-[#e9fcf8] border"
              />
            </div>
          </div>
          {/* <Button
            className="h-7 bg-[#0DA485] hover:bg-[#0da486e2] text-[#FAFDFD] font-medium-medium text-md rounded-2xl py-4 px-6 mr-3 float-right "
            onClick={() => handlePrevisualize()}
            disabled={loading}
          >
            {loading ? (
              <Loader2Icon className="mr-2 animate-spin" size={20} />
            ) : (
              <Scroll className="h-5 w-auto ml-2" />
            )}
            <p className="p-4">Previsualizacion de factura</p>
          </Button> */}
          <br />

          {/* <Button disabled={loading} onClick={generateComprobante}>
            {loading && <Loader2Icon className="mr-2 animate-spin" size={20} />}
            Generar nuevo comprobante
          </Button> */}
        </section>
      </LayoutContainer>
    </>
  );
}
