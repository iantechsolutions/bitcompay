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
import { cn, htmlBill } from "~/lib/utils";
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

  // const afipCuit = new Afip({
  //   CUIT: taxId,
  // });

  // const res = await afipCuit.CreateCert(_username, _password, alias);
  // console.log("Certificado creado");
  // console.log(res);
  const wsid = "wsfe";

  // // //ESTO CREA LA AUTORIZACION
  // const cert = res.cert;
  // const key = res.key;
  const cert =
    "-----BEGIN CERTIFICATE-----\nMIIDSDCCAjCgAwIBAgIINW8P8tjDO30wDQYJKoZIhvcNAQENBQAwODEaMBgGA1UEAwwRQ29tcHV0\nYWRvcmVzIFRlc3QxDTALBgNVBAoMBEFGSVAxCzAJBgNVBAYTAkFSMB4XDTI0MDYyNzE3MDM1MloX\nDTI2MDYyNzE3MDM1MlowLjERMA8GA1UEAwwIYWZpcHNkazIxGTAXBgNVBAUTEENVSVQgMjM0Mzky\nMTQ2MTkwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC/E7NK4NM5k/KCl7Miuu2BAEby\n1D6aSyqL8IRKBA7kWgu+fDXW2RoCJocqzVUimooze0xXnLGcoBwd39ynBH/tANgxrJIie5Ej1YFB\nPNJdMKvV/UdmTjMD0hg/H+e0OsK7cffmQEDvBY1a+HADGbp/j3RnhU0aDD0ZO2lXQxCD6FEPkq/z\nVSKDxDty8GlDwRslgzljaT92upFeoMokgD0vA5tsr3+L2kpqqSDMh8utaY4Sfdyo2qNQhPMgimQA\nZZAsBUzsAuOhSKgs7Z3kNdlMAdqFJUy7qqOOIdqEdALsXxFIGxs2vYss1yLXF8rYUqg0Eab77UTT\nDHYco8drtDSpAgMBAAGjYDBeMAwGA1UdEwEB/wQCMAAwHwYDVR0jBBgwFoAUs7LT//3put7eja8R\nIZzWIH3yT28wHQYDVR0OBBYEFCNehzQ1I5CvmOsqpKzrcTdY+MrxMA4GA1UdDwEB/wQEAwIF4DAN\nBgkqhkiG9w0BAQ0FAAOCAQEAoldnbMx/KTn0i/kHMUrG/+fTcjb428O1ofxv19qHPf2IHGTzUXRw\n+/fnei15xzLGMNAu5rKgdJ4OwmopVCUkMW+nw4hV3wG7sO2OSuduSNNmMZsVJUBnMobc+BIhpPPW\n2Xswuy2vD0NWgMdkoPtV9b0lGX3Z6jWexxKpf8d0OFkt8eQY7f5EWsCQQONfq25z8phzS6Bsj4/Z\nWCgnJUzyIeg1D1Lq3kGbTjgCAe2QP+zctw3tpWFLBQQHmGnJOxrdTI9xl+IcLqAg2z39a8FtRNhl\nr8R2o293M+zkM0eKbEGhJcnyXNF3aNAjACborQdDQGxDcrjDg1lX07r44SlTaA==\n-----END CERTIFICATE-----";
  const key =
    "-----BEGIN RSA PRIVATE KEY-----\r\nMIIEpAIBAAKCAQEAvxOzSuDTOZPygpezIrrtgQBG8tQ+mksqi/CESgQO5FoLvnw1\r\n1tkaAiaHKs1VIpqKM3tMV5yxnKAcHd/cpwR/7QDYMaySInuRI9WBQTzSXTCr1f1H\r\nZk4zA9IYPx/ntDrCu3H35kBA7wWNWvhwAxm6f490Z4VNGgw9GTtpV0MQg+hRD5Kv\r\n81Uig8Q7cvBpQ8EbJYM5Y2k/drqRXqDKJIA9LwObbK9/i9pKaqkgzIfLrWmOEn3c\r\nqNqjUITzIIpkAGWQLAVM7ALjoUioLO2d5DXZTAHahSVMu6qjjiHahHQC7F8RSBsb\r\nNr2LLNci1xfK2FKoNBGm++1E0wx2HKPHa7Q0qQIDAQABAoIBAATXvfqO2iuiaUoQ\r\nCDVAIZbcZ+/tmyyT7R8g2Gl70tjMw3FvennYhMU7Lr/R9m9rFUeav2OVEBdVI4FK\r\nVDBTd96M3+3aXtXK5fHPjngVz4sXGbPRuIaKQta882peJ6Q0vQy9JbhLNpoYPO3q\r\nUAR0GXr0KtIY2cxoNQA3tkLE6108ceMC+UqcGH/XrFTdKx0DqeBQA9PoXhfNGAML\r\nl1tMIMHDIsOrnB6MM2TAZT8ZtrwlBmmgLgKf2mlbYUlljMm+9xjg3StjJklZ8l9/\r\nnxZfSyeUxJFDXNeVVTYtknyAUOzUQJIBeyEdrn5gn4q2H9pmzgXvdhl5MKWt9gyk\r\n6SmBc7UCgYEA4TxTWzRZgTowWgAPaoSa1bY//X/Y6MNDJ/9ILJuUgmy33T5jWw3P\r\nDyP9+TKnVXTI5K6Fbwxi8bRqqNUsjoP7+EvVg1frMtqQt5m1PNQ1aMwRqoLEwX76\r\nTLc1TBnFShjnDIIhfZqjxjpyuMiI4uU996lbJEhA6laoAR0ynmrOB1MCgYEA2Sz4\r\nFDt0mb6vcSnms4GIxfpMnScxtNhF93QPWDI6eoGUj/k4mekcWS73StGtAn7x9ApV\r\nRFYNzhcgM6wufUgMX1YY+D1FhADJjWeanraNEs/JU0yFhHbEQLiYTV11UncfBwuh\r\nlwtoR1OgYYdJ7PRd1UNu1ma4grt9UBGignxCAJMCgYBTXMB9QSLfcWnz5ZHPGsUz\r\n1ABbErZ1b8+rPhC4cdzFaPekKzMawEGimO+nC9hjCJZSDUXVlAAK9XuEgWG8XZ0k\r\niOy9cAzdBYgKbBloKiKaZu0i7sNj2ltJiYVwZRlgE1dwiblbg6CZ/Yf4XEBNugr1\r\nXvkctKFSGkCUKPpTJ7SZgQKBgQCsc+oW3tOLVoEoQlagykaat1RpInt1GJwOkImy\r\nxkfricQ3w3YvuY06QHI8Zl2U8ssct6vX1OGnenOmtJ5B+5lfhxXS4Yy28o0aDWAZ\r\nkepaOseqrsQDWPAkWLEQFhuYvWDVDmZlc7h9kyly6KRKVg3A0IhOFkmD/m/Wyfoa\r\n1aLvowKBgQCBe/ukvw2xiS81LAIkKZPogUwKiYY/tGVtjVGrwvuEiSu0k3TN/7FL\r\njlsOJeyLqmx2GIwuXnQXGFjn06GAbzHprlG5+pW7q48xuEkuM7gAAY0BYYJSurPE\r\naazPGk3fFPEaYX1HtGN5CTbdBLEA45fXxxuA+Ea3rsQQ7Uhs03aRVg==\r\n-----END RSA PRIVATE KEY-----\r\n";
  const afip = new Afip({
    // access_token: 'sjqzE9JPiq9EtrWQR0MSYjehQHlYGPLn7vdAEun9ucUQQiZ6gWV9xMJVwJd5aaSy',
    CUIT: taxId,
    cert: cert,
    key: key,
    // production: true,
  });
  const serSer = await afip.CreateWSAuth(_username, _password, alias, wsid);
  console.log(serSer);
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
