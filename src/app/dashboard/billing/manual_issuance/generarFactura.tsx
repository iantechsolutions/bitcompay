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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { Factura } from "./facturaGenerada";

export async function ingresarAfip() {
  //CUIT QUE QUEREMOS QUE COBRE
  const taxId = 23439214619;

  //USUARIO PARA ENTRAR A AFIP
  const _username = "23439214619";

  //CONTRASEÑA PARA ENTRAR A AFIPs
  const _password = "TBzQ.,i5JhZbAg2";

  // //ALIAS PARA EL CERTIFICADO
  const alias = "afipsdk2";
  // const afipCuit = new Afip({
  //   CUIT: taxId,
  //   access_token:
  //     "sjqzE9JPiq9EtrWQR0MSYjehQHlYGPLn7vdAEun9ucUQQiZ6gWV9xMJVwJd5aaSy",
  //   production: true,
  // });

  const afipCuit = new Afip({
    CUIT: taxId,
  });

  const res = await afipCuit.CreateCert(_username, _password, alias);
  console.log("Certificado creado");
  console.log(res);
  // const wsid = "wsfe";

  // // //ESTO CREA LA AUTORIZACION
  const cert = res.cert;
  const key = res.key;
  // const cert =
  //     '-----BEGIN CERTIFICATE-----\nMIIDQzCCAiugAwIBAgIIBDcBTy1RV9IwDQYJKoZIhvcNAQENBQAwMzEVMBMGA1UEAwwMQ29tcHV0\nYWRvcmVzMQ0wCwYDVQQKDARBRklQMQswCQYDVQQGEwJBUjAeFw0yNDA1MTQxMjQ1NTZaFw0yNjA1\nMTQxMjQ1NTZaMC4xETAPBgNVBAMMCGFmaXBzZGsyMRkwFwYDVQQFExBDVUlUIDIzNDM5MjE0NjE5\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv2gtWDrfV7m9Lz1dYFimDivBff/UCrBB\nQHUuREfIcwL3cs0TDQ075Nk6GyPIIclvVBAUrIXHNDAEgLM3uxY/eSNO/kL9OpjTbleSNUxPyfZz\nwbFsS93ZZb37iA72J2ffgS8TRT9q0tiDnx5dUBv+lVIBliwbxGR6qgEGvgLwZHy7oSKfiYXV8vuc\n+Dt5kNbBVEZTyYyhSMYrM80TcStVrMYuFAz4GJiJRR3g258tJAVARB2KU6tNdaeZ/dmkFzQF/kL8\n9SsIVXEj/8HuLK1qNPoY/qIyD35xqlBW5VYeQMlqRC87V/eKWXUCQM/O+wett6QzB4OGYwBwZYsE\nMNFqWQIDAQABo2AwXjAMBgNVHRMBAf8EAjAAMB8GA1UdIwQYMBaAFCsNL8jfYf0IyU4R0DWTBG2O\nW9BuMB0GA1UdDgQWBBSqnCsGiIw8kqJgF80pSpuLASPB/zAOBgNVHQ8BAf8EBAMCBeAwDQYJKoZI\nhvcNAQENBQADggEBAJQMwlkuNIan9Em48HBUG03glquZsyF74uWLwBAXJ5KAoWHJDU8k1nsRLmw4\n4qw0jWpDPBX1kTvdYVq2412lndnXCdoBiOCjBibwApylqV3pZGyHDTfhWEYBBF+0TOLB/w2FVhSk\n7mbtmWTZ8twqJtORuBbolkM1QTWVuFCWRHX2wSINnjP23NxnLIf6CTJKdMUsAZ7YxAubuWIw3IYd\nGASuLrUCpAlyrA1jpGa3k1vBgTawt/9vWMrbX9uumefFRTM38xB+JPlIY5pN1vEOTreVfAyK7MGR\n1IH2RXkvV3n+YJkj+pcQZG5xOuYuLdeuki4jPy7Q/i3DlAhRYDONgDI=\n-----END CERTIFICATE-----'
  // const key =
  //     '-----BEGIN RSA PRIVATE KEY-----\r\nMIIEpQIBAAKCAQEAv2gtWDrfV7m9Lz1dYFimDivBff/UCrBBQHUuREfIcwL3cs0T\r\nDQ075Nk6GyPIIclvVBAUrIXHNDAEgLM3uxY/eSNO/kL9OpjTbleSNUxPyfZzwbFs\r\nS93ZZb37iA72J2ffgS8TRT9q0tiDnx5dUBv+lVIBliwbxGR6qgEGvgLwZHy7oSKf\r\niYXV8vuc+Dt5kNbBVEZTyYyhSMYrM80TcStVrMYuFAz4GJiJRR3g258tJAVARB2K\r\nU6tNdaeZ/dmkFzQF/kL89SsIVXEj/8HuLK1qNPoY/qIyD35xqlBW5VYeQMlqRC87\r\nV/eKWXUCQM/O+wett6QzB4OGYwBwZYsEMNFqWQIDAQABAoIBAQCQFCct5wL/0fyq\r\ndpK3V4OH30ADTHOcqBg2IP72vuIQUQdbDytsA642EZ4/l6uqYyq+KGyngPv2OL7q\r\n8fzdg128Hev0URC07x0YTirsm8jjyfRQtPFEGnbusxeHz1tTRkljwL/MvHP4yqop\r\nOH4dMzVryRMQq5srNkdveN5OYX/64uxGM2uM+ZVXtMb7ve4KX5GZKCt2fyEC5ZTJ\r\n/B2i/by7NJtm3+VtiVrifi3U2oxjQ0Es1j9COBEWY8JtpIZw9PoP93Hb/zliipJW\r\nXRC6UGd7aF4KOi2vIt619dTD/jsRSweidNGluGdVfHkwQ2BIuLzepA4IU1Z6UKX2\r\nmu2NPXCRAoGBAN7zoRJmNeLf/i0xWHSkyhC3kKgV0wvICbXYVAFBCBEnM2p7Kx7v\r\nyIzQCg+qFtdqSh8Xv1hgo5hFP5QbiavCRbJa+Jb8ZPsqrmEhrE5HYoPamjRuSRi+\r\nzcH43O21fAX/eMhFl5g60i0svMP4hqhcVqli26Lt8iwvyKb83squ6c6XAoGBANvH\r\nhD2dVrRRcBC5+JOrJ2JKgGIqcX8TD9JKQqsHX6bytVUL4aOebgJqXHIBZPU8cRCx\r\nB+1dX5O8fjqkUNIWzq1IqAZtwZopjp1AGoctSzj9J3zYyjoK7AWaeDuyu2ZIzCef\r\nVat8k9Q1RdCovfhfQHZlV84+zJ7l8WWx0SFdpZyPAoGBAI5Mh2C79ebBOnTTyvZf\r\n+0xiLSTrERGy8merFCrcu+5ey9VJmcMcHi+p1NIcqImDIJ3pxUn+HExi3mqEjQEg\r\ndOWaZJHRtA4PNs9t85DexQUNMGEIhwUROzhzw2bA79DQNuH0cQZLfLwykqSt6hxp\r\nGzLvkunR30DOms3iFbzdmQMvAoGBAL/wP9JbnYQ+9yL0d13nhK63p+WTcalr6U5b\r\nIlwhRW0U3D5Y8Qcm7qZXY0MBar0tuwS7xtOKz1TDsm3eYOMJnhgBsxRiOEk9b9pv\r\nSHuzl9U+aYUEA6CrNzMxkz13u2f5vaoA4h2w353dpIo1RCssbKy5lvR9LdC7upV4\r\ntM5x7ZeLAoGAYs2nPABoUPrqKTOZmZg2ob0LKFnSxzFYNrxnIxyJN4CPbg5WJNFK\r\nUwOzB1oOezdIKBJ2eO7tidTa3DJ4HuMqvyChlnmQfL/98jCnnkwnVXldEfWwrKs/\r\npPiKvjFCOZROnwm3PhTfZtEi3Lpn6GNIy7rjl7eFOxgGGNCMkx34ehY=\r\n-----END RSA PRIVATE KEY-----\r\n'
  const afip = new Afip({
    // access_token: 'sjqzE9JPiq9EtrWQR0MSYjehQHlYGPLn7vdAEun9ucUQQiZ6gWV9xMJVwJd5aaSy',
    CUIT: taxId,
    cert: cert,
    key: key,
    // production: true,
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
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return year + month + day;
  }
  return null;
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
          tipoFactura
        );
      } catch {
        last_voucher = 0;
      }

      const numero_de_factura = last_voucher + 1;

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
      const res = await afip.ElectronicBilling.createVoucher(data);

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
      const html = htmlBill();
      const name = "PDF de prueba"; // NOMBRE
      const options = {
        width: 8, // Ancho de pagina en pulgadas. Usar 3.1 para ticket
        marginLeft: 0.4, // Margen izquierdo en pulgadas. Usar 0.1 para ticket
        marginRight: 0.4, // Margen derecho en pulgadas. Usar 0.1 para ticket
        marginTop: 0.4, // Margen superior en pulgadas. Usar 0.1 para ticket
        marginBottom: 0.4, // Margen inferior en pulgadas. Usar 0.1 para ticket
      };

      //MANDAMOS PDF A AFIP, hay que agregar el qr al circuito, y levantar resHtml, por que actualmente solo se logea
      const resHtml = await afip.ElectronicBilling.createPDF({
        html: html,
        file_name: name,
        options: options,
      });
      console.log(resHtml);
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
                        onSelect={setDateDesde}
                        initialFocus={true}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="relative left-2">
                  <Label htmlFor="importe">Fecha de fin de servicio</Label>
                  <Popover>
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
                        onSelect={setDateHasta}
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
                  <Popover>
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
                        onSelect={setDateVencimiento}
                        initialFocus={true}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}
          {tipoFactura !== "11" &&
            tipoFactura !== "14" &&
            tipoFactura !== "15" &&
            tipoFactura !== "" && (
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
              <Label htmlFor="afiliado">Afiliado</Label>
              <br />
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
export function htmlBill() {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="style.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <title>Document</title>
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: "Roboto", sans-serif;
      }

      header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        border-bottom: 1px solid #8fefdc;
        width: 100%;
      }

      .items-1 {
        margin: 8px;
      }

      .items-1 p {
        font-size: 13px;
        font-weight: 400;
        color: #303030;
      }

      .logo {
        width: 30vw;
        height: auto;
        margin-bottom: 5px;
      }

      .items-2 {
        display: flex;
        align-items: center;
        margin-top: 39px;

        margin-bottom: 1px;
      }

      .items-2 img {
        width: 60px;
      }

      .items-3 {
        margin: 8px;
      }

      .items-3 h2 {
        font-size: 20px;
        font-weight: 500;
        color: #323232;
        line-height: 25px;
      }

      .items-3 p {
        font-size: 15px;
        font-weight: 400;
        color: #303030;
        line-height: 20px;
      }

      .parte-2 {
        display: flex;
        justify-content: space-between;
        border-top: none;
        border-bottom: 1px solid #8fefdc;
      }

      .datos-1 {
        font-size: 18px;
        font-weight: 500;
        margin: 10px 10px 10px 30px;
        list-style-type: none;
        line-height: 30px;
      }

      .datos-2 {
        font-size: 18px;
        font-weight: 500;
        list-style-type: none;
        line-height: 30px;
        margin: 10px 10px 10px 30px;
      }

      .parte-3 {
        display: flex;
        justify-content: space-between;
        border-top: none;
        border-bottom: 1px solid #8fefdc;
      }

      .parte-3 p {
        font-size: 15px;
        font-weight: 600;
        margin: 7px;
        color: #323232;
        margin-left: 30px;
        margin-right: 30px;
      }

      .parte-5 {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #8fefdc;
        padding-bottom: 20px;
      }

      .parte-5 p {
        font-size: 18px;
        line-height: 25px;
        margin: 10px 30px 0 25px;
      }

      .parte-4 {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #8fefdc;
      }

      .parte-4 p {
        font-size: 16px;
        font-weight: 500;
        color: #323232;
        margin: 5px 30px 5px 25px;
      }

      .parte-4 p span {
        text-decoration: none;
        font-weight: 600;
      }

      .parte-6 h2 {
        margin-top: 10px;
        margin-left: 30px;
        font-size: 16px;
        font-weight: 500;
      }

      .parte-6 p {
        margin-top: 10px;
        margin-left: 30px;
      }

      .logos {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 10px;
        margin-left: 30px;
        padding: 2px;
        border: 2px dashed #8fefdc;
      }

      .pago-facil {
        margin-left: 30px;
        height: 63px;
        width: 65px;
      }

      .rapi-pago {
        width: 110px;
      }

      .mercado-pago {
        height: 60px;
        width: 65px;
      }

      .cod-barras {
        width: 270px;
      }

      .cbu-section h2 {
        margin-left: 30px;
        margin-top: 10px;
        margin-bottom: 5px;
        font-weight: 400;
        font-size: 15px;
      }

      .cbu-section-2 {
        display: flex;
        justify-content: space-between;
        margin-left: 30px;
        border: 2px dashed #8fefdc;
        padding: 10px;
      }

      .cbu-section-2 p {
        font-size: 20px;
        font-weight: 550;
        margin-right: 50px;
      }

      .pago-mis {
        height: 30px;
        width: 200px;
      }

      .cards h2 {
        margin-left: 30px;
        margin-top: 10px;
        margin-bottom: 5px;
        font-weight: 400;
        font-size: 15px;
      }

      .cards-section {
        display: flex;
        justify-content: space-between;
        margin-left: 30px;
        border: 2px dashed #8fefdc;
        padding: 8px;
      }

      .visa {
        height: 45px;
        width: 95px;
      }

      .visa-debit {
        height: 45px;
        width: 93px;
      }

      .mastercard {
        height: 45px;
        width: 70px;
      }

      .master-debit {
        height: 45px;
        width: 70px;
      }

      .cbu {
      }

      .factura-vencimiento {
        margin-left: 30px;
        margin-top: 10px;
        border: 2px dashed #8fefdc;
        padding: 2px;
      }

      .factura-vencimiento p {
        font-style: oblique;
        font-size: 15px;
        font-weight: 550;
      }

      .qr-section {
        font-size: 15px;
        line-height: 30px;
        gap: 10px;
        display: flex;
        margin-top: 20px;
        margin-left: 30px;
      }

      .qr {
        width: 150px;
      }

      .cae-section {
        flex-direction: column;
      }

      .afip {
        width: 150px;
      }

      .bp-logo {
        width: 80px;
      }
    </style>
  </head>
  <body>
    <header>
      <div class="items-1">
        <img
          class="logo"
          src="https://utfs.io/f/f426d7f1-f9c7-437c-a722-f978ab23830d-neiy4q.png"
          alt=""
        />
        <p>
          CONSULT-RENT S.R.L<br />
          BOLIVAR 547 Piso: 1 Dpto: 1, C.A.B.A <br />
          IVA RESPONSABLE INSCRIPTO
        </p>
      </div>

      <div class="items-2">
        <img
          src="https://utfs.io/f/8ab5059a-71e9-4cb2-8e0c-4743f73c8fe5-kmcofx.png"
          alt=""
        />
      </div>

      <div class="items-3">
        <h2>
          FACTURA <br />
          N° 0009-00001004
        </h2>
        <p>
          Fecha: 26/04/2024 <br />
          C.U.I.T: 30-71054237-2 <br />
          Ing. Brutos Conv.Multil: 30-71054237-2 <br />
          Fecha de Inicio de Actividad: 13/05/2008
        </p>
      </div>
    </header>

    <section class="parte-2">
      <ul class="datos-1">
        <li>
          <p>Cliente:</p>
        </li>
        <li>
          <p>Domicilio:</p>
        </li>
        <li>
          <p>Localidad:</p>
        </li>
        <li>
          <p>Provincia:</p>
        </li>
        <li>
          <p>CP:</p>
        </li>
      </ul>

      <ul class="datos-2">
        <li>
          <p>C.U.I.T::</p>
        </li>
        <li>
          <p>Categoria I.V.A:</p>
        </li>
        <li>
          <p>Condicion de Venta:</p>
        </li>
        <li>
          <p>Periodo facturado:</p>
        </li>
        <li>
          <p>Fecha de vencimiento:</p>
        </li>
      </ul>
    </section>

    <section class="parte-3">
      <p>CONCEPTOS</p>
      <p>IMPORTE</p>
    </section>

    <section class="parte-5">
      <div>
        <p>Plan de salud Esmeralda -- Periodo 05/2024</p>
        <p>Bonificacion: 15%</p>
        <p>Aportes</p>
        <p>Factura periodo anterior impaga</p>
        <p>Interes por pago fuera de termino</p>
        <p>Pago a cuenta</p>
      </div>

      <div>
        <p>$ 281,392. 67</p>
        <p>$ 281,392. 67</p>
        <p>$ 281,392. 67</p>
        <p>$ 281,392. 67</p>
        <p>$ 281,392. 67</p>
        <p>$ 281,392. 67</p>
      </div>
    </section>

    <section class="parte-4">
      <p>Pesos Doscientos sesenta mil noventa y cuatro con 85/100</p>
      <p><span>TOTAL: </span> $ 260,094.85</p>
    </section>

    <section class="parte-6">
      <h2>Canales de Pago Habilitados</h2>
      <p>Mediante lectura del codigo de barras:</p>

      <div class="logos">
        <img
          class="pago-facil"
          src="https://utfs.io/f/79d56fb6-2cb7-4760-bbc6-add1a1e434f6-tkdz7.png"
          alt=""
        />
        <img
          class="rapi-pago"
          src="https://utfs.io/f/501ea573-2d69-4f4b-9ae3-95531c540d9c-h1yi1.jpg"
          alt=""
        />
        <img
          class="mercado-pago"
          src="https://utfs.io/f/781ea16d-cac2-46de-9b9a-e59db510e17b-8b1bm4.png"
          alt=""
        />
        <img
          class="cod-barras"
          src="https://utfs.io/f/73e104e8-fb1f-490f-a30e-7de1608ef3ac-12ad.png"
          alt=""
        />
      </div>
    </section>

    <section class="cbu-section">
      <h2>Ingresando el codigo electronico de pagos:</h2>
      <div class="cbu-section-2">
        <img
          class="pago-mis"
          src="https://utfs.io/f/a215f09e-25e8-4eb3-9d1c-6adf1d17baa5-pvvezi.png"
          alt=""
        />
        <p>20214823838</p>
      </div>
    </section>

    <section class="cards">
      <h2>Debito Automatico en Tarjetas y/o Cuentas Bancarias</h2>
      <div class="cards-section">
        <img
          class="visa"
          src="https://utfs.io/f/6f4442e1-57c1-4df8-a810-29258735b429-reuj6w.png"
          alt=""
        />
        <img
          class="visa-debit"
          src="https://utfs.io/f/8d48ec18-1d0b-4e61-9db3-e304cb732abf-q42cl4.png"
          alt=""
        />
        <img
          class="mastercard"
          src="https://utfs.io/f/23711681-416d-4155-9894-4e6c8584219f-mgfpcc.png"
          alt=""
        />
        <img
          class="master-debit"
          src="https://utfs.io/f/23711681-416d-4155-9894-4e6c8584219f-mgfpcc.png"
          alt=""
        />
        <img
          class="cbu"
          src="https://utfs.io/f/0405e613-cee2-41c4-830d-8403002b6c98-4o63ls.png"
          alt=""
        />
      </div>
    </section>

    <section class="factura-vencimiento">
      <p>Esta factura se debitara en fecha de vencimiento en CBU ###########</p>
    </section>

    <section class="qr-section">
      <div>
        <img
          class="qr"
          src="https://utfs.io/f/2dd25618-943b-41f4-8c0e-363fc8ba3228-n3iun9.png"
          alt=""
        />
      </div>
      <div class="cae-section">
        <img
          class="afip"
          src="https://utfs.io/f/ef966741-623a-4972-a11e-0b0c6b099a76-t0whb5.png"
          alt=""
        />
        <p>CAE N° ####</p>
        <p>Fecha de Vto. de CAE:</p>
        <p>
          Powered by
          <img
            class="bp-logo"
            src="https://utfs.io/f/fa110834-238b-4880-a8c2-eedebe9e6b6e-mnl13r.png"
            alt=""
          />
        </p>
      </div>
    </section>
  </body>
</html>
`;
  return htmlContent;
}
