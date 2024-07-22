"use client";
import Afip from "@afipsdk/afip.js";
import { format } from "date-fns";
import { Loader2Icon, PlusCircleIcon } from "lucide-react";
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
  // const { mutateAsync: createItemReturnComprobante } =
  //   api.items.createReturnComprobante.useMutation();
  const { mutateAsync: createEventFamily } =
    api.events.createByType.useMutation();
  const { mutateAsync: createEventOrg } =
    api.events.createByTypeOrg.useMutation();
  const { data: company } = api.companies.get.useQuery();
  const { data: marcas } = api.brands.list.useQuery();
  const { data: gruposFamiliar } = api.family_groups.list.useQuery();
  const { data: comprobantes } = api.comprobantes.list.useQuery();
  const [logo, setLogo] = useState("");
  const [fcSelec, setFCSelec] = useState("");
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
          const billResponsible = gruposFamiliar
            ?.find((x) => x.id == grupoFamiliarId)
            ?.integrants.find((x) => x.isBillResponsible);
          comprobante = await createComprobante({
            billLink: "",
            concepto: Number(concepto) ?? 0,
            importe: Number(importe) ?? 0,
            iva: iva ?? "0",
            nroDocumento: Number(billResponsible?.fiscal_id_number) ?? 0,
            ptoVenta: Number(puntoVenta) ?? 0,
            tipoDocumento:
              idDictionary[billResponsible?.fiscal_id_type ?? ""] ?? 0,
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
            DocTipo: idDictionary[billResponsible?.fiscal_id_type ?? ""],
            DocNro: billResponsible?.fiscal_id_number ?? 0,
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

          const billResponsible = gruposFamiliar
            ?.find((x) => x.id == grupoFamiliarId)
            ?.integrants.find((x) => x.isBillResponsible);
          comprobante = await createComprobante({
            billLink: "",
            concepto: Number(concepto) ?? 0,
            importe: Number(importe) ?? 0,
            iva: "0",
            nroDocumento: Number(billResponsible?.fiscal_id_number) ?? 0,
            ptoVenta: Number(puntoVenta) ?? 0,
            tipoDocumento:
              idDictionary[billResponsible?.fiscal_id_type ?? ""] ?? 0,
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
        if (comprobante && comprobante[0]) {
          const html = htmlBill(
            comprobante[0],
            company,
            undefined,
            2,
            marcas?.find((x) => x.id === brandId)!
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

  // async function saveComprobante(numero_de_comprobante: number) {
  //   const comprobante = await createComprobante({
  //     billLink: "",
  //     concepto: Number(concepto),
  //     importe: Number(importe),
  //     iva: iva,
  //     nroDocumento: Number(nroDocumento),
  //     ptoVenta: Number(puntoVenta),
  //     tipoDocumento: Number(tipoDocumento),
  //     tipoComprobante: tipoComprobante,
  //     fromPeriod: dateDesde,
  //     toPeriod: dateHasta,
  //     due_date: dateVencimiento,
  //     generated: new Date(),
  //     prodName: servicioprod,
  //     nroComprobante: numero_de_comprobante,
  //   });
  //   const updatedComprobante = await createItemReturnComprobante({
  //     concept: "Comprobante Manual",
  //     amount: Number(importe),
  //     iva: 0,
  //     total: Number(importe),
  //     abono: 0,
  //     comprobante_id: comprobante[0]?.id ?? "",
  //   });
  //   return updatedComprobante;
  // }
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

  // function showFactura() {}
  const [puntoVenta, setPuntoVenta] = useState("");
  const [tipoComprobante, setTipoComprobante] = useState("");
  const [concepto, setConcepto] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [nroDocumento, setNroDocumento] = useState("");
  const [importe, setImporte] = useState("");
  const [dateDesde, setDateDesde] = React.useState<Date>();
  const [dateHasta, setDateHasta] = React.useState<Date>();
  const [dateVencimiento, setDateVencimiento] = React.useState<Date>();
  const [servicioprod, setservicioprod] = useState("");
  const [iva, setIva] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [grupoFamiliarId, setGrupoFamiliarId] = useState("");

  const products = api.products.list.useQuery().data;
  const channelList = api.channels.list.useQuery().data;
  const [selectedProduct, setSelectedProduct] = useState("");
  const [channelsFiltered, setChannelsFiltered] = useState<
    Channel[] | undefined
  >(undefined);
  const [brandId, setBrandId] = useState("");
  function handleGrupoFamilarChange(value: string) {
    setGrupoFamiliarId(value);
    let grupo = gruposFamiliar?.find((x) => x.id == value);
    let billResponsible = grupo?.integrants.find((x) => x.isBillResponsible);

    setNroDocumento(billResponsible?.fiscal_id_number ?? "");
    setTipoDocumento(billResponsible?.fiscal_id_type ?? "");
    setBrandId(grupo?.businessUnitData?.brandId ?? "");
  }
  let selectedBrand;

  const [selectedChannel, setSelectedChannel] = useState("");

  const [popoverDesdeOpen, setPopoverDesdeOpen] = useState(false);
  const [popoverFinOpen, setPopoverFinOpen] = useState(false);
  const [popoverVencimientoOpen, setPopoverVencimientoOpen] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      const product = products?.find((x) => x.id === selectedProduct);

      const channels = product?.channels.flatMap(
        (chanel) => channelList?.filter((x) => x.id === chanel.channelId) || []
      );

      setChannelsFiltered(channels);
    }
  }, [selectedProduct, products, channelList]);

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

  const handleBrandChange = (value: string) => {
    selectedBrand = marcas?.find((marca) => marca.id === value);
    setBrandId(value);
  };

  return (
    <>
      <LayoutContainer>
        <section className="space-y-2">
          <div>
            <Title>Facturación</Title>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="family_group">Grupo Familiar</Label>
              <br />
              <Select onValueChange={(e) => handleGrupoFamilarChange(e)}>
                <SelectTrigger className="w-[180px] font-bold">
                  <SelectValue placeholder="Seleccione un grupo familiar" />
                </SelectTrigger>
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

              {/* <ComboboxDemo
                title="Afiliado"
                placeholder="Afiliado"
                options={[
                  { value: "Juan Hernandez", label: "Juan Hernandez" },
                  { value: "Joaquin Sabina", label: "Sabina" },
                ]}
                onSelectionChange={(e) => setName(e)}
              /> */}
            </div>
            <div>
              <Label htmlFor="name">Punto de venta a utilizar</Label>
              <br />
              <Select onValueChange={(e) => setPuntoVenta(e)}>
                <SelectTrigger className="w-[180px] font-bold">
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
              <Label htmlFor="factura">Tipo de factura</Label>
              <br />
              <Select onValueChange={(e) => setTipoComprobante(e)}>
                <SelectTrigger className="w-[180px] font-bold">
                  <SelectValue placeholder="Seleccionar factura..." />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: "3", label: "FACTURA A" },
                    { value: "6", label: "FACTURA B" },
                    // { value: "8", label: "NOTA DE DEBITO A" },
                    // { value: "13", label: "NOTA DE DEBITO B" },
                    { value: "2", label: "NOTA DE CREDITO A" },
                    { value: "12", label: "NOTA DE CREDITO B" },
                    { value: "0", label: "RECIBO" },
                    // { value: "15", label: "NOTA DE DEBITO C" },
                    // { value: "52", label: "NOTA DE DEBITO M" },
                    // { value: "20", label: "NOTA DE DEBITO E" },
                    // { value: "11", label: "FACTURA C" },
                    // { value: "51", label: "FACTURA M" },
                    // { value: "19", label: "FACTURA E" },
                    // { value: "14", label: "NOTA DE CREDITO C" },
                    // { value: "53", label: "NOTA DE CREDITO M" },
                    // { value: "21", label: "NOTA DE CREDITO E" },
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
            {(tipoComprobante == "2" || tipoComprobante == "12") && (
              <div>
                <Label> Factura a Cancelar</Label>
                <br />
                <Select onValueChange={(e) => setFCSelec(e)}>
                  <SelectTrigger className="w-[180px] font-bold">
                    <SelectValue placeholder="Seleccione una factura" />
                  </SelectTrigger>
                  <SelectContent>
                    {gruposFamiliar?.find((x) => x.id == grupoFamiliarId) &&
                      gruposFamiliar
                        ?.find((x) => x.id == grupoFamiliarId)
                        ?.comprobantes.filter((x) => x.estado != "generada")
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
            )}
            <div>
              <Label>Marca</Label>
              <Select
                onValueChange={handleBrandChange}
                value={brandId}
                disabled={true}
              >
                <SelectTrigger className="w-[180px] font-bold">
                  <SelectValue placeholder="Seleccione una marca" />
                </SelectTrigger>
                <SelectContent>
                  {marcas &&
                    marcas.map((marca) => (
                      <SelectItem
                        key={marca!.id}
                        value={marca!.id}
                        className="rounded-none border-b border-gray-600"
                      >
                        {marca!.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tipoDocumento">Tipo de documento</Label>
              <br />
              <Select
                onValueChange={(e) => setTipoDocumento(e)}
                value={tipoDocumento}
                disabled={true}
              >
                <SelectTrigger className="w-[180px] font-bold">
                  <SelectValue placeholder="Tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: "CUIT", label: "CUIT" },
                    { value: "CUIL", label: "CUIL" },
                    { value: "DNI", label: "DNI" },
                    // { value: "99", label: "Consumidor Final" },
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
              <Label htmlFor="nroDocumento">Número de documento</Label>
              <Input
                disabled={true}
                id="nroDocumento"
                placeholder="..."
                value={tipoDocumento !== "99" ? nroDocumento : "0"}
                onChange={(e) => setNroDocumento(e.target.value)}
              />
            </div>
            {(tipoComprobante == "3" ||
              tipoComprobante == "6" ||
              tipoComprobante == "0") && (
              <>
                <div>
                  <Label htmlFor="concepto">Concepto del comprobante</Label>
                  <br />
                  <Select onValueChange={(e) => setConcepto(e)}>
                    <SelectTrigger className="w-[180px] font-bold">
                      <SelectValue placeholder="Concepto" />
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
                  <Label htmlFor="importe">Importe total del comprobante</Label>
                  <Input
                    id="importe"
                    placeholder="..."
                    value={importe}
                    onChange={(e) => setImporte(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nombreprod">
                    {concepto === "1"
                      ? "Nombre del producto"
                      : "Nombre del servicio"}{" "}
                  </Label>
                  <Input
                    id="nombrepro"
                    placeholder="..."
                    value={servicioprod}
                    onChange={(e) => setservicioprod(e.target.value)}
                  />
                </div>
              </>
            )}
            {(tipoComprobante == "3" || tipoComprobante == "6") && (
              <>
                <div>
                  <Label htmlFor="nroDocumento">Productos disponibles</Label>
                  <Select
                    onValueChange={(value) => {
                      setSelectedProduct(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar un producto..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="importe">Fecha de vencimiento</Label>
                  <br />
                  <Popover
                    open={popoverVencimientoOpen}
                    onOpenChange={setPopoverVencimientoOpen}
                  >
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[220px] justify-start text-left font-normal",
                          !dateVencimiento && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateVencimiento ? (
                          format(dateVencimiento, "PPP")
                        ) : (
                          <span>Selecciona una fecha</span>
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
                  <Label htmlFor="iva">IVA</Label>
                  <br />
                  <Select onValueChange={(e) => setIva(e)}>
                    <SelectTrigger className="w-[180px] font-bold">
                      <SelectValue placeholder="IVA" />
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
              </>
            )}

            {(concepto === "2" || concepto === "3") && (
              <>
                <div>
                  <Label htmlFor="importe">Fecha de inicio de servicio</Label>
                  <br />
                  <Popover
                    open={popoverDesdeOpen}
                    onOpenChange={setPopoverDesdeOpen}
                  >
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[220px] justify-start text-left font-normal",
                          !dateDesde && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateDesde ? (
                          format(dateDesde, "PPP")
                        ) : (
                          <span>Selecciona una fecha</span>
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
                  <Label htmlFor="importe">Fecha de fin de servicio</Label>
                  <br />
                  <Popover
                    open={popoverFinOpen}
                    onOpenChange={setPopoverFinOpen}
                  >
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[220px] justify-start text-left font-normal",
                          !dateHasta && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateHasta ? (
                          format(dateHasta, "PPP")
                        ) : (
                          <span>Selecciona una fecha</span>
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
              </>
            )}
          </div>
          <br />
          <Button disabled={loading} onClick={generateComprobante}>
            {loading && <Loader2Icon className="mr-2 animate-spin" size={20} />}
            Generar nuevo comprobante
          </Button>
        </section>
      </LayoutContainer>
    </>
  );
}
