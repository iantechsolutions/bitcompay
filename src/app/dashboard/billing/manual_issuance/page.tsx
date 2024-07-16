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
import { cn, htmlBill, ingresarAfip } from "~/lib/utils";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { Factura } from "./facturaGenerada";
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
  const { mutateAsync: createFactura } = api.facturas.create.useMutation();
  const { mutateAsync: createItemReturnFactura } =
    api.items.createReturnFactura.useMutation();
  const { data: company } = api.companies.get.useQuery();
  const { data: marcas } = api.brands.list.useQuery();
  const [logo, setLogo] = useState("");

  function generateFactura() {
    if (marcas) {
      setLogo(marcas[0]!.logo_url!);
    }
    try {
      (async () => {
        console.log("1");

        setLoading(true);

        const afip = await ingresarAfip();
        // const ivas = await afip.ElectronicBilling.getAliquotTypes();

        // const serverStatus = await afip.ElectronicBilling.getServerStatus();

        let last_voucher;
        try {
          last_voucher = await afip.ElectronicBilling.getLastVoucher(
            puntoVenta,
            tipoFactura
          );
        } catch {
          last_voucher = 0;
        }

        const numero_de_factura = (await last_voucher) + 1;

        const fecha = new Date(
          Date.now() - new Date().getTimezoneOffset() * 60000
        )
          .toISOString()
          .split("T")[0];

        const data = {
          CantReg: 1, // Cantidad de facturas a registrar
          PtoVta: puntoVenta,
          CbteTipo: tipoFactura,
          Concepto: Number(concepto),
          DocTipo: tipoDocumento,
          DocNro: tipoDocumento !== "99" ? nroDocumento : 0,
          CbteDesde: numero_de_factura,
          CbteHasta: numero_de_factura,
          CbteFch: parseInt(fecha?.replace(/-/g, "") ?? ""),
          FchServDesde: formatDate(dateDesde),
          FchServHasta: formatDate(dateHasta),
          FchVtoPago: formatDate(dateVencimiento),
          ImpTotal: importe,
          ImpTotConc: 0, // Importe neto no gravado
          ImpNeto: (Number(importe) * 1).toString(),
          ImpOpEx: 0,
          ImpIVA: 0,
          ImpTrib: 0,
          MonId: "PES",
          MonCotiz: 1,
          // Iva: {
          //   Id: 5,
          //   BaseImp: importe,
          //   Importe: (Number(importe) * 0, 21).toString(),
          // },
        };

        const fac = await saveFactura(numero_de_factura);

        const res = await afip.ElectronicBilling.createVoucher(data);
        if (fac) {
          const html = htmlBill(
            fac,
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
          const resHtml = await afip.ElectronicBilling.createPDF({
            html: html,
            file_name: name,
            options: options,
          });

          console.log("resultadHTML", resHtml);
          console.log(html);
        }
        setLoading(false);
        toast.success("La factura se creo correctamente");
      })();
    } catch {
      toast.error("Error");
    }
  }

  async function saveFactura(numero_de_factura: number) {
    const factura = await createFactura({
      billLink: "",
      concepto: Number(concepto),
      importe: Number(importe),
      iva: iva,
      nroDocumento: Number(nroDocumento),
      ptoVenta: Number(puntoVenta),
      tipoDocumento: Number(tipoDocumento),
      tipoFactura: tipoFactura,
      fromPeriod: dateDesde,
      toPeriod: dateHasta,
      due_date: dateVencimiento,
      generated: new Date(),
      prodName: servicioprod,
      nroFactura: numero_de_factura,
    });
    const updatedFactura = await createItemReturnFactura({
      concept: "Factura Manual",
      amount: Number(importe),
      iva: 0,
      total: Number(importe),
      abono: 0,
      comprobante_id: factura[0]?.id ?? "",
    });
    return updatedFactura;
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

  // function showFactura() {}
  const [puntoVenta, setPuntoVenta] = useState("");
  const [tipoFactura, setTipoFactura] = useState("");
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
  const [name, setName] = useState("");

  const products = api.products.list.useQuery().data;
  const channelList = api.channels.list.useQuery().data;
  const [selectedProduct, setSelectedProduct] = useState("");
  const [channelsFiltered, setChannelsFiltered] = useState<
    Channel[] | undefined
  >(undefined);
  const [brandId, setBrandId] = useState("");
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
              <Label htmlFor="name">Punto de venta a utilizar</Label>
              <br />
              <ComboboxDemo
                title="Seleccionar PV..."
                placeholder="_"
                options={[
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                ]}
                onSelectionChange={(e) => setPuntoVenta(e)}
              />
            </div>
            <div>
              <Label htmlFor="factura">Tipo de factura</Label>
              <br />
              <ComboboxDemo
                title="Seleccionar factura..."
                placeholder="Factura X"
                options={[
                  { value: "3", label: "FACTURA A" },
                  { value: "6", label: "FACTURA B" },
                  { value: "11", label: "FACTURA C" },
                  { value: "51", label: "FACTURA M" },
                  { value: "19", label: "FACTURA E" },
                  { value: "8", label: "NOTA DE DEBITO A" },
                  { value: "13", label: "NOTA DE DEBITO B" },
                  { value: "15", label: "NOTA DE DEBITO C" },
                  { value: "52", label: "NOTA DE DEBITO M" },
                  { value: "20", label: "NOTA DE DEBITO E" },
                  { value: "2", label: "NOTA DE CREDITO A" },
                  { value: "12", label: "NOTA DE CREDITO B" },
                  { value: "14", label: "NOTA DE CREDITO C" },
                  { value: "53", label: "NOTA DE CREDITO M" },
                  { value: "21", label: "NOTA DE CREDITO E" },
                ]}
                onSelectionChange={(e) => setTipoFactura(e)}
              />
            </div>
            <div>
              <Label htmlFor="concepto">Concepto de la factura</Label>
              <br />
              <ComboboxDemo
                title="Seleccionar concepto..."
                placeholder="Concepto"
                options={[
                  { value: "1", label: "Productos" },
                  { value: "2", label: "Servicios" },
                  { value: "3", label: "Productos y Servicios" },
                ]}
                onSelectionChange={(e) => setConcepto(e)}
              />
            </div>
            <div>
              <Label htmlFor="importe">Importe total de la factura</Label>
              <Input
                id="importe"
                placeholder="..."
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="afiliado">Afiliado</Label>
              <br />
              <ComboboxDemo
                title="Afiliado"
                placeholder="Afiliado"
                options={[
                  { value: "Juan Hernandez", label: "Juan Hernandez" },
                  { value: "Joaquin Sabina", label: "Sabina" },
                ]}
                onSelectionChange={(e) => setName(e)}
              />
            </div>
            {tipoFactura !== "11" &&
              tipoFactura !== "14" &&
              tipoFactura !== "15" &&
              tipoFactura !== "" && (
                <div>
                  <Label htmlFor="iva">IVA</Label>
                  <br />
                  <ComboboxDemo
                    title="Seleccionar una opcion"
                    placeholder="IVA"
                    options={[
                      { value: "3", label: "0%" },
                      { value: "4", label: "10.5%" },
                      { value: "5", label: "21%" },
                      { value: "6", label: "27%" },
                      { value: "8", label: "5%" },
                      { value: "9", label: "2.5%" },
                    ]}
                    onSelectionChange={(e) => setIva(e)}
                  />
                </div>
              )}
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
            {selectedProduct && channelsFiltered && (
              <div>
                <Label htmlFor="channel">Canal habilitado</Label>
                <br></br>
                <ComboboxDemo
                  title="Seleccionar canal..."
                  placeholder="Canal..."
                  options={
                    channelsFiltered?.map((channel) => ({
                      value: channel.id,
                      label: channel.name,
                    })) ?? []
                  }
                  onSelectionChange={(e) => setSelectedChannel(e)}
                />
              </div>
            )}
            <div>
              <Label htmlFor="nroDocumento">Número de documento</Label>
              <Input
                id="nroDocumento"
                placeholder="..."
                value={tipoDocumento !== "99" ? nroDocumento : "0"}
                onChange={(e) => setNroDocumento(e.target.value)}
              />
            </div>
            {!name ? (
              <div>
                <Label htmlFor="tipoDocumento">Tipo de documento</Label>
                <br />
                <ComboboxDemo
                  title="Seleccionar una opción"
                  placeholder="Tipo de documento"
                  options={[
                    { value: "80", label: "CUIT" },
                    { value: "86", label: "CUIL" },
                    { value: "96", label: "DNI" },
                    { value: "99", label: "Consumidor Final" },
                  ]}
                  onSelectionChange={(e) => setTipoDocumento(e)}
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="tipoDocumento">Tipo de documento</Label>
                <br />
                <ComboboxDemo
                  title="Seleccionar una opción"
                  placeholder="Tipo de documento"
                  options={[{ value: "99", label: "Consumidor Final" }]}
                  onSelectionChange={(e) => setTipoDocumento(e)}
                />
              </div>
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
                  <Label>Marca</Label>
                  <Select onValueChange={handleBrandChange}>
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
              </>
            )}
          </div>

          <Button disabled={loading} onClick={generateFactura}>
            {loading && <Loader2Icon className="mr-2 animate-spin" size={20} />}
            Generar nueva Factura
          </Button>
        </section>
      </LayoutContainer>
    </>
  );
}
