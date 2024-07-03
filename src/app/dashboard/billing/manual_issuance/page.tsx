"use client";
import Afip from "@afipsdk/afip.js";
import { format } from "date-fns";
import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
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

  function generateFactura() {
    try {
      (async () => {
        console.log("1");

        setLoading(true);

        const afip = ingresarAfip();
        // const ivas = await afip.ElectronicBilling.getAliquotTypes();

        // const serverStatus = await afip.ElectronicBilling.getServerStatus();

        let last_voucher;
        try {
          last_voucher = (await afip).ElectronicBilling.getLastVoucher(
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
        /**
         * Creamos la Factura
         **/

        const res = (await afip).ElectronicBilling.createVoucher(data);

        // CREAMOS HTML DE LA FACTURA
        // const html = Factura({
        //   puntoDeVenta: puntoVenta,
        //   tipoFactura: tipoFactura,
        //   concepto: concepto,
        //   documentoComprador: tipoDocumento,
        //   nroDocumento: nroDocumento,
        //   total: Number(importe),
        //   facturadoDesde: formatDate(dateDesde),
        //   facturadoHasta: formatDate(dateHasta),
        //   vtoPago: formatDate(dateVencimiento),
        //   cantidad: 1,
        //   nroComprobante: numero_de_factura,
        //   nroCae: res.CAE,
        //   vtoCae: res.CAEFchVto,
        //   nombreServicio: "Servicio de prueba",
        //   domicilioComprador: "Calle falsa 123",
        //   nombreComprador: "Homero Simpson",
        // });

        setLoading(false);

        saveFactura(numero_de_factura);

        toast.success("La factura se creo correctamente");
      })();
    } catch {
      toast.error("Error");
    }
  }

  function saveFactura(numero_de_factura: number) {
    createFactura({
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
  }

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

  const [popoverDesdeOpen, setPopoverDesdeOpen] = useState(false);
  const [popoverFinOpen, setPopoverFinOpen] = useState(false);
  const [popoverVencimientoOpen, setPopoverVencimientoOpen] = useState(false);

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

  return (
    <>
      <LayoutContainer>
        <section className="space-y-2">
          <div>
            <Title>Facturacion</Title>
          </div>
          <div className="flex flex-row justify-between">
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
                onSelectionChange={(e) => {
                  setPuntoVenta(e);
                }}
              />
            </div>
            <div className="relative right-20">
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
                onSelectionChange={(e) => {
                  setTipoFactura(e);
                }}
              />
            </div>
          </div>

          <div className="flex flex-row justify-between">
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
            {/* Importe de la Factura */}
            <div className="relative right-20">
              <Label htmlFor="importe">Importe total de la factura</Label>
              <Input
                id="importe"
                placeholder="..."
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-row justify-between">
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
                <div className="relative right-20">
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
          </div>

          <div className="flex flex-row justify-between">
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
          </div>

          <div className="flex flex-row justify-between">
            <div>
              <Label htmlFor="nroDocumento">Numero de documento</Label>
              <Input
                id="nroDocumento"
                placeholder="..."
                value={tipoDocumento !== "99" ? nroDocumento : "0"}
                onChange={(e) => setNroDocumento(e.target.value)}
              />
            </div>
            {!name ? (
              <div className="relative right-20">
                <Label htmlFor="tipoDocumento">Tipo de documento</Label>
                <br />
                <ComboboxDemo
                  title="Seleccionar una opcion"
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
              <div className="relative right-20">
                <Label htmlFor="tipoDocumento">Tipo de documento</Label>
                <br />
                <ComboboxDemo
                  title="Seleccionar una opcion"
                  placeholder="Tipo de documento"
                  options={[{ value: "99", label: "Consumidor Final" }]}
                  onSelectionChange={(e) => setTipoDocumento(e)}
                />
              </div>
            )}
          </div>
          {(concepto === "2" || concepto === "3") && (
            <div>
              <div className="flex flex-row justify-between">
                {/* Los siguientes campos solo son obligatorios para los conceptos 2 y 3 */}

                <div>
                  <Label htmlFor="importe">Fecha de inicio de servicio</Label>
                  <br />
                  <Popover
                    open={popoverDesdeOpen}
                    onOpenChange={setPopoverDesdeOpen}>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[220px] justify-start text-left font-normal",
                          !dateDesde && "text-muted-foreground"
                        )}>
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

                <div className="relative right-18">
                  <Label htmlFor="importe">Fecha de fin de servicio</Label>
                  <br />
                  <Popover
                    open={popoverFinOpen}
                    onOpenChange={setPopoverFinOpen}>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[220px] justify-start text-left font-normal",
                          !dateHasta && "text-muted-foreground"
                        )}>
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
              </div>
              <div className="flex flex-row justify-between">
                <div>
                  <Label htmlFor="importe">Fecha de vencimiento</Label>
                  <br />
                  <Popover
                    open={popoverVencimientoOpen}
                    onOpenChange={setPopoverVencimientoOpen}>
                    <PopoverTrigger asChild={true}>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[220px] justify-start text-left font-normal",
                          !dateVencimiento && "text-muted-foreground"
                        )}>
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
              </div>
            </div>
          )}

          <Button disabled={loading} onClick={generateFactura}>
            {loading && <Loader2Icon className="mr-2 animate-spin" size={20} />}
            Generar nueva Factura
          </Button>
        </section>
      </LayoutContainer>
    </>
  );
}
