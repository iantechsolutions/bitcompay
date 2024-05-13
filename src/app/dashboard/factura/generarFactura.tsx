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
import { ToastAction } from "~/components/ui/toast";
import { useToast } from "~/components/ui/use-toast";

export async function ingresarAfip() {
  //CUIT QUE QUEREMOS QUE COBRE
  const taxId = 23439214619;

  //USUARIO PARA ENTRAR A AFIP
  const username = "23439214619";

  //CONTRASEÑA PARA ENTRAR A AFIPs
  const password = "TBzQ.,i5JhZbAg2";

  //ALIAS PARA EL CERTIFICADO
  const alias = "afipsdk";
  const afipCuit = new Afip({
    CUIT: taxId,
    access_token:
      "T11zSjRqweUhefsFkp0rn1jlvY2KyX1zRo4aRVpmfLR5fowH0kov709vL6Zn9i1F",
    production: true,
  });
  // const res = await afipCuit.CreateCert(username, password, alias);
  // console.log("Certificado creado");
  // console.log(res);
  const wsid = "wsfe";

  // //ESTO CREA LA AUTORIZACION
  // const cert = res.cert;
  // const key = res.key;
  const cert =
    "-----BEGIN CERTIFICATE-----\nMIIDQjCCAiqgAwIBAgIIdCXx+jXkmS0wDQYJKoZIhvcNAQENBQAwMzEVMBMGA1UEAwwMQ29tcHV0\nYWRvcmVzMQ0wCwYDVQQKDARBRklQMQswCQYDVQQGEwJBUjAeFw0yNDA1MTAxNTU3MjBaFw0yNjA1\nMTAxNTU3MjBaMC0xEDAOBgNVBAMMB2FmaXBzZGsxGTAXBgNVBAUTEENVSVQgMjM0MzkyMTQ2MTkw\nggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDABvAAKxop0QQa6OTEdl+Eci5skbTUi7F/\nCTpM4OZVo84b0PJ+Gb/Hc3IZIBAAPtnFBEJLaJgXXGJWXVYCOUUzUv+LKAEgXy73iq1sA3yobNZa\nP4OvDcRgrDmj/rawInxf7gIM5bhUZFx2EnJQ9bUa/pGvYeq0UF4rLbmpgM/o6MMv9W65AE1Kpl4h\nc9e7qb1PdB35yCUauNmE/2Zyf2j5ow0pzg99cKI1xtYmtfci7XVDmxU8/A9LvcVWIwNmcQ8QisZ3\n+9bAwZ0GzGcTAyEuvms5HJWUU1Crpk8C46O8l6f2yQX0ehvK+/nmUGu8KWFXPBoaK8mSuGsOLFo8\nzqdDAgMBAAGjYDBeMAwGA1UdEwEB/wQCMAAwHwYDVR0jBBgwFoAUKw0vyN9h/QjJThHQNZMEbY5b\n0G4wHQYDVR0OBBYEFI4OMvXVnB2CCdOgCw/ifvAzIea+MA4GA1UdDwEB/wQEAwIF4DANBgkqhkiG\n9w0BAQ0FAAOCAQEAvjP+YP2HWfTSFtYpV9Z9PyKr5OS6gvNmFiUCk/5EctIkceynMlvuL0XgcTSB\nwlr9joA44Vjh3PPbiPWdf4woc32sSimBS0NtuJcxPKpsm0eFy2okqFI+zgRNMDIKMCVL9iNEpvEf\nehi1wlxQI3NKWZHkeJpOKU97lzQQw2mvTNsSeKfqxk/Lpu4XT5u36TYYLspYjiLYXplBYoJo6yVP\nqXgtEmcChZFFk3aSVrU+twMgAXsGbUGokphfN4Cx2S9K97Vaa6XVRm0hEX2JxGi6WCO48R+ctfhr\n3js3d2quH3zRVTCZ682wMpOoZdY9tWJzRl/mrxPg+Ic5Qsg8+f7qEg==\n-----END CERTIFICATE-----";
  const key =
    "-----BEGIN RSA PRIVATE KEY-----\r\nMIIEpAIBAAKCAQEAwAbwACsaKdEEGujkxHZfhHIubJG01Iuxfwk6TODmVaPOG9Dy\r\nfhm/x3NyGSAQAD7ZxQRCS2iYF1xiVl1WAjlFM1L/iygBIF8u94qtbAN8qGzWWj+D\r\nrw3EYKw5o/62sCJ8X+4CDOW4VGRcdhJyUPW1Gv6Rr2HqtFBeKy25qYDP6OjDL/Vu\r\nuQBNSqZeIXPXu6m9T3Qd+cglGrjZhP9mcn9o+aMNKc4PfXCiNcbWJrX3Iu11Q5sV\r\nPPwPS73FViMDZnEPEIrGd/vWwMGdBsxnEwMhLr5rORyVlFNQq6ZPAuOjvJen9skF\r\n9Hobyvv55lBrvClhVzwaGivJkrhrDixaPM6nQwIDAQABAoIBADcYxnwF4ffllPvz\r\nntAP9tAVwuQ72lqxyjfc+fFdBjnESjsI9MrhsHkV0sMKxAyN/AXfdvYUCK+LPlvx\r\nY+A3dneHdPMEg246YUt9asz3IylgMRCr8Killpb2U4OObfSTsIQF0mjI8N6l/TGT\r\nkWFRXqlkKYDc427hMGPLNt4/q2f0Ab7viqw5mIU3kWuRkS64CWRIzcmYKKZx1usl\r\ne5j6Q9uBKh7YgOT/fa3o5CTZmXu5WsKP9kHIa4pTeLIQ63P5AiaXK9UXBS6o5QpS\r\nvgzBhPLdNYQrsX9cRY6tfxau5MIl1I3wAvioxTHcX4WNelb36Lm9u7+PsoQiKk8A\r\nLriRdUECgYEA6mZOB37wlZLZ9RyB+DsZzB4ellh1CwS+lW700vCiiN8uqaDzz4jU\r\ndnMVyF/OQVoM1xZ+KUVHe2EhDIK3x8oaeRlF9mdpJZDaTrgg4noG6Cm8vFV0UKKL\r\nkP5dKVHCgYWoV6Bght8zD0toDM/UzwvryO0Qz2q9Vl7l71w/VkhLsCkCgYEA0bkG\r\n89YvPOFY+yNKdqtnJxmrivlMwR95PW3R2YE9CMIcvwV3vdanWj9Ou1xPXQ6Y+Uh3\r\nsIgkW+XVXrvfJmo7YhMGC77ZdGQLaiUtVlD/5w6rov+9igIX130ax9xlNj2LE7sJ\r\nPVhRJwmMnDGWraw8EyMf1em1GzP57k9hT6OyGYsCgYEAyHfqsDp+pE3OHvXcqmJR\r\nc+MmocrRfzT1knQs6uNm/sxx6h1/p7UMkKlordBSZE4RwTq5d66Krhip3TtG1pYh\r\nAgT9cvmKUdiK/Nw5M7jNg21+v0wOiJAb8Uu6fYYxZfjbuuWs6GyoDKKfQKXXCaTW\r\naSdnQx21BNNwr8AjYzW9ldECgYAxi+/7jV9tl6OI+WZvMMFW+HaRh6I9ge0HuTk5\r\nlJHRzuIxst3+KIczB//WvdE2H+u+AQPd3dwRJfRJxELM9Y3/9pSYE8eV+sjDk/Lp\r\nEIvUj5+3C4pA34u4aiL4krYKoXGJAMgHCSVq/pOMlx6M+0LaFpM/203hFl92kKRh\r\nxz+dTwKBgQCK1yPFGDeCBnDxwHHf+zK+6+mKmsKvDiOInFpMR/j2sETIfDnclq4i\r\ny1UvicJYL0/WW1T0A9rHyhSu2BMH8zkrmEC4Sa7MEGD3B3HfT50yke1QL+hdWZx0\r\nCGtbc2r1DqhJg0mXROOltX0RQlUri5m8P/s0wLI+L2NwFF78WpR3vQ==\r\n-----END RSA PRIVATE KEY-----\r\n";
  const afip = new Afip({
    access_token:
      "T11zSjRqweUhefsFkp0rn1jlvY2KyX1zRo4aRVpmfLR5fowH0kov709vL6Zn9i1F",
    CUIT: taxId,
    cert: cert,
    key: key,
    production: true,
  });
  const serSer = await afip.CreateWSAuth(username, password, alias, wsid);
  console.log(serSer);
  const salesPoints = await afip.ElectronicBilling.getSalesPoints();
  console.log(salesPoints);
  // const serSer = await afip.CreateWSAuth(username, password, alias, wsid);

  return afip;
}

interface FacturaDialog {
  receivedHtml: string;
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

export function FacturaDialog({ receivedHtml }: FacturaDialog) {
  async function generateFactura() {
    (async () => {
      setLoading(true);
      const afip = await ingresarAfip();
      const serverStatus = await afip.ElectronicBilling.getServerStatus();
      console.log("status");
      console.log(serverStatus);

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
      console.log("aca1");
      const fecha = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split("T")[0];

      console.log("aca2");
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
      console.log("aca4");
      /**
       * Creamos la Factura
       **/
      const res = await afip.ElectronicBilling.createVoucher(data);
      console.log("aca5");
      /**
       * Mostramos por pantalla los datos de la nueva Factura
       **/
      console.log({
        cae: res.CAE, //CAE asignado a la Factura
        vencimiento: res.CAEFchVto, //Fecha de vencimiento del CAE
      });
      console.log("aca6");
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
      console.log("aca7");
      console.log(html);
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
      console.log(html);
      console.log(resHtml.file);
      toast({
        onClick: () => window.open(resHtml.file, "_blank"),
        title: "Factura generada",
        description:
          "La factura ha sido generada correctamente, clickee aqui para abrirla ",
      });
      setLoading(false);
    })();
  }
  const { toast } = useToast();
  async function showFactura() {}
  const [puntoVenta, setPuntoVenta] = useState("");
  const [tipoFactura, setTipoFactura] = useState("");
  const [concepto, setConcepto] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [nroDocumento, setNroDocumento] = useState("");
  const [importe, setImporte] = useState("");
  // const [fechaServicioDesde, setFechaServicioDesde] = useState("");
  // const [fechaServicioHasta, setFechaServicioHasta] = useState("");
  // const [fechaVencimientoPago, setFechaVencimientoPago] = useState("");
  const [dateDesde, setDateDesde] = React.useState<Date>();
  const [dateHasta, setDateHasta] = React.useState<Date>();
  const [dateVencimiento, setDateVencimiento] = React.useState<Date>();
  const [isLoading, setIsLoading] = useState(false);
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
              {/* <Input
                className="w-[220px]"
                id="puntoVenta"
                placeholder="..."
                value={puntoVenta}
                onChange={(e) => setPuntoVenta(e.target.value)}
                required
              /> */}

              <ComboboxDemo
                title="Seleccionar PV..."
                placeholder="_"
                options={[
                  { value: "1", label: "1" },
                  { value: "2", label: "2" },
                ]}
                onSelectionChange={(e) => {
                  setPuntoVenta(e);
                  console.log(e);
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
                  console.log(e);
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
            <div className="relative right-14">
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
          {tipoFactura != "11" && tipoFactura != "14" && tipoFactura != "15"}

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
