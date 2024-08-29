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
  const [comprobantes, setComprobantes] = useState<any[]>([]);
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
      console.log("afip loaded");
      console.log("voucherTypes", voucherTypes);
      console.log("aliquot types", ivaTypes);
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
          const event = createEventFamily({
            family_group_id: grupoFamiliarId,
            type: "NC",
            amount: comprobante[0]?.importe ?? 0,
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
          });
        } else if (tipoComprobante == "0") {
          // iva = 0;

          //
          comprobante = await createComprobante({
            billLink: "",
            concepto: Number(concepto) ?? 0,
            importe: Number(importe) * ivaFloat + Number(tributos) ?? 0,
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

        // let barcodeImage;

        // function BarCode() {
        //   if (comprobante?.length && products?.length) {
        //     const pago = comprobante[0]!.payments[0];

        //     return (
        //       <BarcodeProcedure
        //         dateVto={pago.first_due_date ?? new Date()}
        //         amountVto={pago.first_due_amount ?? 0}
        //         client={pago.fiscal_id_number ?? 0}
        //         isPagoFacil={true}
        //         invoiceNumber={pago.invoice_number ?? 0}
        //       />
        //     );
        //   } else {
        //     return "lol";
        //   }

        // if (comprobante?.length && products?.length) {
        //   const pago = comprobante[0]!.payments[0];
        //   console.log(pago, "------2-------");

        //   if (pago) {
        //     try {
        //       barcodeImage = BarcodeProcedure({
        //         dateVto: pago.first_due_date ?? new Date(),
        //         amountVto: pago.first_due_amount ?? 0,
        //         client: pago.fiscal_id_number ?? 0,
        //         isPagoFacil: true,
        //         invoiceNumber: pago.invoice_number ?? 0,
        //       });
        //     } catch {
        //       barcodeImage = "lol";
        //     }
        //   }

        //   console.log("llegoppp", barcodeImage);
        // }

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
  const [loading, setLoading] = useState(true);
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
        <section className="space-y-5">
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
          <div className="bg-[#F7F7F7] rounded-lg py-4 px-24 flex flex-row justify-between ">
            <ElementCard
              element={{ key: "NOMBRE", value: nombre }}
              className="pr-24 "
            ></ElementCard>
            <div className="flex gap-20">
              <ElementCard
                element={{ key: "DNI", value: nroDocumentoDNI }}
                className="pr-8 "
              ></ElementCard>
              <ElementCard
                element={{ key: "CUIT", value: nroDocumento }}
                className="pr-11 "
              ></ElementCard>
            </div>
          </div>

          <div className="border rounded-lg px-6 pt-7 pb-8">
            <p className=" text-lg font-semibold">Datos del Comprobante</p>
            <div className="grid grid-cols-2 gap-4 gap-x-10 mt-3">
              <ElementCard
                className="pr-1 pb-0 border-[#bef0bb]"
                element={{
                  key: "Punto de venta",
                  value: (
                    <Select onValueChange={(e) => setPuntoVenta(e)}>
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
                  ),
                }}
              />
              <ElementCard
                className="pr-1 pb-0 border-[#bef0bb]"
                element={{
                  key: "Fecha de emisión",
                  value: (
                    <Popover
                      open={popoverEmisionOpen}
                      onOpenChange={setPopoverEmisionOpen}
                    >
                      <PopoverTrigger asChild={true}>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                            !dateEmision && "text-muted-foreground"
                          )}
                        >
                          {dateEmision ? (
                            format(dateEmision, "PPP")
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <Calendar01Icon className="h-4 w-4" />
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
                  ),
                }}
              />
              <ElementCard
                className="pr-1 pb-0 border-[#bef0bb]"
                element={{
                  key: "Tipo Comprobante",
                  value: (
                    <Select onValueChange={(e) => setTipoComprobante(e)}>
                      <SelectTrigger className="border-none focus:ring-transparent px-0 py-0 h-8">
                        <SelectValue placeholder="Seleccionar comprobante..." />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { value: "1", label: "FACTURA A" },
                          { value: "6", label: "FACTURA B" },
                          { value: "3", label: "NOTA DE CREDITO A" },
                          { value: "8", label: "NOTA DE CREDITO B" },
                          { value: "0", label: "RECIBO" },
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
                  ),
                }}
              />
              <ElementCard
                className="pr-1 pb-0 border-[#bef0bb]"
                element={{
                  key: "Alicuota",
                  value: (
                    <Select onValueChange={(e) => setIva(e)}>
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
                  ),
                }}
              />
              <ElementCard
                className="pr-1 pb-0 border-[#bef0bb]"
                element={{
                  key: "Tipo de concepto",
                  value: (
                    <Select onValueChange={(e) => setConcepto(e)}>
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
                  ),
                }}
              />
              <ElementCard
                className="pr-1 pb-0 border-[#bef0bb]"
                element={{
                  key: "Fecha de vencimiento",
                  value: (
                    <Popover
                      open={popoverVencimientoOpen}
                      onOpenChange={setPopoverVencimientoOpen}
                    >
                      <PopoverTrigger asChild={true}>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                            !dateVencimiento && "text-muted-foreground"
                          )}
                        >
                          {dateVencimiento ? (
                            format(dateVencimiento, "PPP")
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <Calendar01Icon className=" h-4 w-4" />
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
                  ),
                }}
              />
              <ElementCard
                className="pr-1 pb-0 border-[#bef0bb]"
                element={{
                  key: "Fecha inicio de servicio",
                  value: (
                    <Popover
                      open={popoverDesdeOpen}
                      onOpenChange={setPopoverDesdeOpen}
                    >
                      <PopoverTrigger asChild={true}>
                        <Button
                          variant={"outline"}
                          disabled={concepto == "" || concepto == "1"}
                          className={cn(
                            "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                            !dateDesde && "text-muted-foreground"
                          )}
                        >
                          {dateDesde ? (
                            format(dateDesde, "PPP")
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <Calendar01Icon className="h-4 w-4" />
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
                  ),
                }}
              />
              <ElementCard
                className="pr-1 pb-0 border-[#bef0bb]"
                element={{
                  key: "Fecha fin de servicio",
                  value: (
                    <Popover
                      open={popoverFinOpen}
                      onOpenChange={setPopoverFinOpen}
                    >
                      <PopoverTrigger asChild={true}>
                        <Button
                          variant={"outline"}
                          disabled={concepto == "" || concepto == "1"}
                          className={cn(
                            "text-left flex justify-between font-medium w-full border-0 shadow-none hover:bg-white pr-0 pl-0",
                            !dateHasta && "text-muted-foreground"
                          )}
                        >
                          {dateHasta ? (
                            format(dateHasta, "PPP")
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <Calendar01Icon className="h-4 w-4" />
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
                  ),
                }}
              />
              <div></div>
            </div>
          </div>

          <div className="border rounded-lg px-4 pt-5 pb-8">
            <p className="text-lg font-semibold">
              Datos del Comprobante Asociado
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <ElementCard
                className="pr-1 pb-0 border-[#bef0bb]"
                element={{
                  key: "COMPROBANTE ASOCIADO",
                  value: (
                    <Select
                      onValueChange={(e) => handleComprobanteChange(e)}
                      disabled={
                        tipoComprobante != "3" && tipoComprobante != "8"
                      }
                    >
                      <SelectTrigger className="border-none focus:ring-transparent px-0 py-0 h-8">
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
                                className="rounded-none "
                              >
                                {comprobante?.nroComprobante}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  ),
                }}
              />
            </div>
          </div>
          <div className="p-0 flex gap-2 ">
            <div className="bg-[#F7F7F7] rounded-lg p-4 flex flex-row justify-between gap-4 w-1/2">
              <ElementCard
                keyClassName="mb-3"
                contentClassName="pl-0 pr-0"
                className="pr-0 pt-0"
                element={{
                  key: "PUNTO DE VENTA",
                  value: (
                    <Input
                      disabled={true}
                      value={selectedComprobante ? puntoVenta : "-"}
                      className="bg-[#f7f7f7] h-6 border-none focus:ring-transparent py-0 pl-0 pb-0 "
                    />
                  ),
                }}
              />
              <ElementCard
                keyClassName="mb-3 "
                contentClassName="pl-0 pr-0 "
                className="pr-0 pt-0"
                element={{
                  key: "Nº FACTURA",
                  value: (
                    <Input
                      disabled={true}
                      value={
                        selectedComprobante
                          ? selectedComprobante.nroComprobante
                          : "-"
                      }
                      className="bg-[#f7f7f7] h-6 border-none focus:ring-transparent py-0 pl-0 pb-0 "
                    />
                  ),
                }}
              />
              <ElementCard
                keyClassName="mb-3"
                contentClassName="pl-0 pr-0"
                className="pr-0 pt-0"
                element={{
                  key: "FECHA EMISION",
                  value: (
                    <Input
                      disabled={true}
                      value={
                        selectedComprobante
                          ? dateNormalFormat(selectedComprobante.createdAt)
                          : "-"
                      }
                      className="bg-[#f7f7f7] h-6 border-none focus:ring-transparent py-0 pl-0 pb-0"
                    />
                  ),
                }}
              />
              <div className="flex flex-col gap-2"></div>
            </div>
            <div className="bg-[#F7F7F7] rounded-lg p-4 flex flex-row justify-between gap-4 w-1/2">
              <ElementCard
                keyClassName="mb-3 "
                contentClassName="pl-0 pr-0 "
                className="pr-0 pt-0"
                element={{
                  key: "DESDE",
                  value: (
                    <Input
                      disabled={true}
                      value={
                        selectedComprobante
                          ? dateNormalFormat(selectedComprobante.fromPeriod)
                          : "-"
                      }
                      className="bg-[#f7f7f7] h-6 border-none focus:ring-transparent py-0 pl-0 pb-0"
                    />
                  ),
                }}
              />
              <ElementCard
                keyClassName="mb-3 "
                contentClassName="pl-0 pr-0 "
                className="pr-0 pt-0"
                element={{
                  key: "HASTA",
                  value: (
                    <Input
                      disabled={true}
                      value={
                        selectedComprobante
                          ? dateNormalFormat(selectedComprobante.toPeriod)
                          : "-"
                      }
                      className="bg-[#f7f7f7] h-6 border-none focus:ring-transparent py-0 pl-0 pb-0"
                    />
                  ),
                }}
              />
              <ElementCard
                keyClassName="mb-3 "
                contentClassName="pl-0 pr-0 "
                className="pr-0 pt-0"
                element={{
                  key: "CONCEPTO",
                  value: (
                    <Input
                      disabled={true}
                      value={
                        selectedComprobante
                          ? reverseConceptDictionary[
                              selectedComprobante.concepto
                            ]
                          : "-"
                      }
                      className="bg-[#f7f7f7] h-6 border-none focus:ring-transparent py-0 pl-0 pb-0"
                    />
                  ),
                }}
              />
              <ElementCard
                keyClassName="mb-3 "
                contentClassName="pl-0 pr-0 "
                className="pr-0 pt-0"
                element={{
                  key: "IMPORTE",
                  value: (
                    <Input
                      disabled={true}
                      value={
                        selectedComprobante ? selectedComprobante.importe : "-"
                      }
                      className="bg-[#f7f7f7] h-6 border-none focus:ring-transparent py-0 pl-0 pb-0"
                    />
                  ),
                }}
              />
            </div>
          </div>

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

          {/* <Button disabled={loading} onClick={generateComprobante}>
            {loading && <Loader2Icon className="mr-2 animate-spin" size={20} />}
            Generar nuevo comprobante
          </Button> */}
        </section>
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
