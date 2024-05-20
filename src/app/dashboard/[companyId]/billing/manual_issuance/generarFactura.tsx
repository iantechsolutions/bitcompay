"use client";
import Afip from "@afipsdk/afip.js";
import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ComboboxDemo } from "~/components/ui/combobox";
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Factura } from "./facturaGenerada";
import { api } from "~/trpc/react";

export async function ingresarAfip() {
  //CUIT QUE QUEREMOS QUE COBRE
  const taxId = 23439214619;

  //USUARIO PARA ENTRAR A AFIP
  const username = "23439214619";

  //CONTRASEÑA PARA ENTRAR A AFIPs
  const password = "TBzQ.,i5JhZbAg2";

  //ALIAS PARA EL CERTIFICADO
  const alias = "afipsdk2";
  const afipCuit = new Afip({
    CUIT: taxId,
    access_token:
      "T11zSjRqweUhefsFkp0rn1jlvY2KyX1zRo4aRVpmfLR5fowH0kov709vL6Zn9i1F",
    production: true,
  });
  // const res = await afipCuit.CreateCert(username, password, alias);
  // console.log("Certificado creado");
  // console.log(res);
  // const wsid = "wsfe";

  // // //ESTO CREA LA AUTORIZACION
  // const cert = res.cert;
  // const key = res.key;
  const cert =
    "-----BEGIN CERTIFICATE-----\nMIIDQzCCAiugAwIBAgIIBDcBTy1RV9IwDQYJKoZIhvcNAQENBQAwMzEVMBMGA1UEAwwMQ29tcHV0\nYWRvcmVzMQ0wCwYDVQQKDARBRklQMQswCQYDVQQGEwJBUjAeFw0yNDA1MTQxMjQ1NTZaFw0yNjA1\nMTQxMjQ1NTZaMC4xETAPBgNVBAMMCGFmaXBzZGsyMRkwFwYDVQQFExBDVUlUIDIzNDM5MjE0NjE5\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv2gtWDrfV7m9Lz1dYFimDivBff/UCrBB\nQHUuREfIcwL3cs0TDQ075Nk6GyPIIclvVBAUrIXHNDAEgLM3uxY/eSNO/kL9OpjTbleSNUxPyfZz\nwbFsS93ZZb37iA72J2ffgS8TRT9q0tiDnx5dUBv+lVIBliwbxGR6qgEGvgLwZHy7oSKfiYXV8vuc\n+Dt5kNbBVEZTyYyhSMYrM80TcStVrMYuFAz4GJiJRR3g258tJAVARB2KU6tNdaeZ/dmkFzQF/kL8\n9SsIVXEj/8HuLK1qNPoY/qIyD35xqlBW5VYeQMlqRC87V/eKWXUCQM/O+wett6QzB4OGYwBwZYsE\nMNFqWQIDAQABo2AwXjAMBgNVHRMBAf8EAjAAMB8GA1UdIwQYMBaAFCsNL8jfYf0IyU4R0DWTBG2O\nW9BuMB0GA1UdDgQWBBSqnCsGiIw8kqJgF80pSpuLASPB/zAOBgNVHQ8BAf8EBAMCBeAwDQYJKoZI\nhvcNAQENBQADggEBAJQMwlkuNIan9Em48HBUG03glquZsyF74uWLwBAXJ5KAoWHJDU8k1nsRLmw4\n4qw0jWpDPBX1kTvdYVq2412lndnXCdoBiOCjBibwApylqV3pZGyHDTfhWEYBBF+0TOLB/w2FVhSk\n7mbtmWTZ8twqJtORuBbolkM1QTWVuFCWRHX2wSINnjP23NxnLIf6CTJKdMUsAZ7YxAubuWIw3IYd\nGASuLrUCpAlyrA1jpGa3k1vBgTawt/9vWMrbX9uumefFRTM38xB+JPlIY5pN1vEOTreVfAyK7MGR\n1IH2RXkvV3n+YJkj+pcQZG5xOuYuLdeuki4jPy7Q/i3DlAhRYDONgDI=\n-----END CERTIFICATE-----";
  const key =
    "-----BEGIN RSA PRIVATE KEY-----\r\nMIIEpQIBAAKCAQEAv2gtWDrfV7m9Lz1dYFimDivBff/UCrBBQHUuREfIcwL3cs0T\r\nDQ075Nk6GyPIIclvVBAUrIXHNDAEgLM3uxY/eSNO/kL9OpjTbleSNUxPyfZzwbFs\r\nS93ZZb37iA72J2ffgS8TRT9q0tiDnx5dUBv+lVIBliwbxGR6qgEGvgLwZHy7oSKf\r\niYXV8vuc+Dt5kNbBVEZTyYyhSMYrM80TcStVrMYuFAz4GJiJRR3g258tJAVARB2K\r\nU6tNdaeZ/dmkFzQF/kL89SsIVXEj/8HuLK1qNPoY/qIyD35xqlBW5VYeQMlqRC87\r\nV/eKWXUCQM/O+wett6QzB4OGYwBwZYsEMNFqWQIDAQABAoIBAQCQFCct5wL/0fyq\r\ndpK3V4OH30ADTHOcqBg2IP72vuIQUQdbDytsA642EZ4/l6uqYyq+KGyngPv2OL7q\r\n8fzdg128Hev0URC07x0YTirsm8jjyfRQtPFEGnbusxeHz1tTRkljwL/MvHP4yqop\r\nOH4dMzVryRMQq5srNkdveN5OYX/64uxGM2uM+ZVXtMb7ve4KX5GZKCt2fyEC5ZTJ\r\n/B2i/by7NJtm3+VtiVrifi3U2oxjQ0Es1j9COBEWY8JtpIZw9PoP93Hb/zliipJW\r\nXRC6UGd7aF4KOi2vIt619dTD/jsRSweidNGluGdVfHkwQ2BIuLzepA4IU1Z6UKX2\r\nmu2NPXCRAoGBAN7zoRJmNeLf/i0xWHSkyhC3kKgV0wvICbXYVAFBCBEnM2p7Kx7v\r\nyIzQCg+qFtdqSh8Xv1hgo5hFP5QbiavCRbJa+Jb8ZPsqrmEhrE5HYoPamjRuSRi+\r\nzcH43O21fAX/eMhFl5g60i0svMP4hqhcVqli26Lt8iwvyKb83squ6c6XAoGBANvH\r\nhD2dVrRRcBC5+JOrJ2JKgGIqcX8TD9JKQqsHX6bytVUL4aOebgJqXHIBZPU8cRCx\r\nB+1dX5O8fjqkUNIWzq1IqAZtwZopjp1AGoctSzj9J3zYyjoK7AWaeDuyu2ZIzCef\r\nVat8k9Q1RdCovfhfQHZlV84+zJ7l8WWx0SFdpZyPAoGBAI5Mh2C79ebBOnTTyvZf\r\n+0xiLSTrERGy8merFCrcu+5ey9VJmcMcHi+p1NIcqImDIJ3pxUn+HExi3mqEjQEg\r\ndOWaZJHRtA4PNs9t85DexQUNMGEIhwUROzhzw2bA79DQNuH0cQZLfLwykqSt6hxp\r\nGzLvkunR30DOms3iFbzdmQMvAoGBAL/wP9JbnYQ+9yL0d13nhK63p+WTcalr6U5b\r\nIlwhRW0U3D5Y8Qcm7qZXY0MBar0tuwS7xtOKz1TDsm3eYOMJnhgBsxRiOEk9b9pv\r\nSHuzl9U+aYUEA6CrNzMxkz13u2f5vaoA4h2w353dpIo1RCssbKy5lvR9LdC7upV4\r\ntM5x7ZeLAoGAYs2nPABoUPrqKTOZmZg2ob0LKFnSxzFYNrxnIxyJN4CPbg5WJNFK\r\nUwOzB1oOezdIKBJ2eO7tidTa3DJ4HuMqvyChlnmQfL/98jCnnkwnVXldEfWwrKs/\r\npPiKvjFCOZROnwm3PhTfZtEi3Lpn6GNIy7rjl7eFOxgGGNCMkx34ehY=\r\n-----END RSA PRIVATE KEY-----\r\n";
  const afip = new Afip({
    access_token:
      "T11zSjRqweUhefsFkp0rn1jlvY2KyX1zRo4aRVpmfLR5fowH0kov709vL6Zn9i1F",
    CUIT: taxId,
    cert: cert,
    key: key,
    production: true,
  });
  // const serSer = await afip.CreateWSAuth(username, password, alias, wsid);
  // console.log(serSer);
  // const salesPoints = await afip.ElectronicBilling.getSalesPoints();
  // console.log(salesPoints);
  // const serSer = await afip.CreateWSAuth(username, password, alias, wsid);

  return afip;
}

function formatDate(date: Date | undefined) {
  if (date) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, "0");
    let day = date.getDate().toString().padStart(2, "0");

    return year + month + day;
  } else {
    return null;
  }
}

export function FacturaDialog() {
  const { mutateAsync: createFactura } = api.facturas.create.useMutation();

  async function generateFactura() {
    (async () => {
      setLoading(true);
      const afip = await ingresarAfip();
      const ivas = await afip.ElectronicBilling.getAliquotTypes();

      const serverStatus = await afip.ElectronicBilling.getServerStatus();

      let last_voucher;
      try {
        last_voucher = await afip.ElectronicBilling.getLastVoucher(
          puntoVenta,
          tipoFactura,
        );
      } catch {
        last_voucher = 0;
      }

      const numero_de_factura = last_voucher + 1;

      const fecha = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000,
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
      const res = await afip.ElectronicBilling.createVoucher(data);

      /**
       * Mostramos por pantalla los datos de la nueva Factura
       **/
      const html = Factura({
        puntoDeVenta: puntoVenta,
        tipoFactura: tipoFactura,
        concepto: concepto,
        documentoComprador: tipoDocumento,
        nroDocumento: nroDocumento,
        total: Number(importe),
        facturadoDesde: formatDate(dateDesde),
        facturadoHasta: formatDate(dateHasta),
        vtoPago: formatDate(dateVencimiento),
        cantidad: 1,
        nroComprobante: numero_de_factura,
        nroCae: res.CAE,
        vtoCae: res.CAEFchVto,
        nombreServicio: "Servicio de prueba",
        domicilioComprador: "Calle falsa 123",
        nombreComprador: "Homero Simpson",
      });
      const name = "PDF de prueba";
      const options = {
        width: 8, // Ancho de pagina en pulgadas. Usar 3.1 para ticket
        marginLeft: 0.4, // Margen izquierdo en pulgadas. Usar 0.1 para ticket
        marginRight: 0.4, // Margen derecho en pulgadas. Usar 0.1 para ticket
        marginTop: 0.4, // Margen superior en pulgadas. Usar 0.1 para ticket
        marginBottom: 0.4, // Margen inferior en pulgadas. Usar 0.1 para ticket
      };
      const resHtml = await afip.ElectronicBilling.createPDF({
        html: html,
        file_name: name,
        options: options,
      });
      setLoading(false);

      saveFactura(numero_de_factura);
      setOpen(false);
    })();
  }
  async function saveFactura(numero_de_factura: number) {
    await createFactura({
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

  async function showFactura() {}
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
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" size={20} />
        Generar nueva factura
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Crear nueva factura</DialogTitle>
          </DialogHeader>
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
          {(concepto === "2" || concepto === "3") && (
            <div>
              <div className="flex flex-row justify-between">
                {/* Los siguientes campos solo son obligatorios para los conceptos 2 y 3 */}

                <div>
                  <Label htmlFor="importe">Fecha de inicio de servicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[220px] justify-start text-left font-normal",
                          !dateDesde && "text-muted-foreground",
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
                        onSelect={setDateDesde}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="relative left-2">
                  <Label htmlFor="importe">Fecha de fin de servicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[220px] justify-start text-left font-normal",
                          !dateHasta && "text-muted-foreground",
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
                        onSelect={setDateHasta}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex flex-row justify-between">
                <div>
                  <Label htmlFor="importe">Fecha de vencimiento</Label>
                  <br />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[220px] justify-start text-left font-normal",
                          !dateVencimiento && "text-muted-foreground",
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
                        onSelect={setDateVencimiento}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}
          {tipoFactura != "11" &&
            tipoFactura != "14" &&
            tipoFactura != "15" &&
            tipoFactura != "" && (
              <div className="flex flex-row justify-between">
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
              </div>
            )}
          <div className="flex flex-row justify-between">
            <div>
              <Label htmlFor="nombreprod">
                {concepto == "1"
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
              <Label htmlFor="afiliado">Afiliado</Label>
              <ComboboxDemo
                title="Afiliado"
                placeholder="Afiliado"
                options={[]}
                onSelectionChange={(e) => setIva(e)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={loading} onClick={generateFactura}>
              {loading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Generar nueva Factura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
