import Afip from "@afipsdk/afip.js";
import { Loader2Icon, PlusCircleIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export async function ingresarAfip() {
  //CUIT QUE QUEREMOS QUE COBRE
  const taxId = 23439214619;

  //USUARIO PARA ENTRAR A AFIP
  const username = "23439214619";

  //CONTRASEÑA PARA ENTRAR A AFIPs
  const password = "TBzQ.,i5JhZbAg2";

  //ALIAS PARA EL CERTIFICADO
  const alias = "afipsdk";

  const afipCuit = new Afip({ CUIT: taxId });
  //   const res = await afipCuit.CreateCert(username, password, alias);
  //   console.log("Certificado creado");
  //   console.log(res);
  //   //ESTO CREA LA AUTORIZACION
  //   const wsid = "BitComPay";
  //   const res = await afipCuit.CreateWSAuth(username, password, alias, wsid);
  const cert =
    "-----BEGIN CERTIFICATE-----\nMIIDRzCCAi+gAwIBAgIISwHLbkA6EKcwDQYJKoZIhvcNAQENBQAwODEaMBgGA1UEAwwRQ29tcHV0\nYWRvcmVzIFRlc3QxDTALBgNVBAoMBEFGSVAxCzAJBgNVBAYTAkFSMB4XDTI0MDQyNjExNDgzMFoX\nDTI2MDQyNjExNDgzMFowLTEQMA4GA1UEAwwHYWZpcHNkazEZMBcGA1UEBRMQQ1VJVCAyMzQzOTIx\nNDYxOTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAOGTq95yObyfTwgS3eeyI/Xz4aJe\nTJGFmeGlwMxeRz7xZJ68gQWdvKwnfuzTSH82v1UpRM6docK4H5G17U+/togSpYk4Pw9U9OUXSsLq\nACSTktOLEVsEIhmRYvcbXJ3nFdczX0u7VORpb1g0iiAz6d6FI/8PdoEsM5UQlkCCq/2va36NyA9C\nrZZ3utTVhHb6+hR2cdRj46aF8BDUT6eljrO2+RlbySo2OBTFhSLowhHmjBkAiQ+FAgyPUnWEy/a2\n7ss48CTJCWRnjNU1T6BzZEpx6nkOPfaWPhjjsW2NxDObguqOBw3gZk8DlJFvvmeht2FI50K3ohSD\nOh1YgRoRtUcCAwEAAaNgMF4wDAYDVR0TAQH/BAIwADAfBgNVHSMEGDAWgBSzstP//em63t6NrxEh\nnNYgffJPbzAdBgNVHQ4EFgQUvGUUMMUluUSYBp/lJ3Nhw20vbFwwDgYDVR0PAQH/BAQDAgXgMA0G\nCSqGSIb3DQEBDQUAA4IBAQAxQF7wDwSNM9I3LixoPUrbW/5PIUHNf/bXMCWE9fGLZ8Gldo0lMPzw\n4jo0Vwcpx3DVtyRkF/ry+p3WkbuYliDeOFzSFkWkfv+bdp0oUbYMY/qysJwqbN8YQLN2K9D4fQfr\nmqMcxdByE7N7+rJxrKzUZTRAsKHT/uTW2qXCGdm4LT8SmwU/n73LULNPNOKlrPDYzkd6kRcePiGq\nJ+gdeo6OOVI+Ivk2XCzb8pRkeMCGsTnsIiTLFsaqAogEpacsndnGVMMlhvUMHM6EPKk0s54mRKsj\nELQqHoAY0lnx7yJmUOpAQ4dtcGFm7UXv0imlmIYyDKkM/23X/2Cwqk9fNMjN\n-----END CERTIFICATE-----";
  const key =
    "-----BEGIN RSA PRIVATE KEY-----\r\nMIIEpAIBAAKCAQEA4ZOr3nI5vJ9PCBLd57Ij9fPhol5MkYWZ4aXAzF5HPvFknryB\r\nBZ28rCd+7NNIfza/VSlEzp2hwrgfkbXtT7+2iBKliTg/D1T05RdKwuoAJJOS04sR\r\nWwQiGZFi9xtcnecV1zNfS7tU5GlvWDSKIDPp3oUj/w92gSwzlRCWQIKr/a9rfo3I\r\nD0Ktlne61NWEdvr6FHZx1GPjpoXwENRPp6WOs7b5GVvJKjY4FMWFIujCEeaMGQCJ\r\nD4UCDI9SdYTL9rbuyzjwJMkJZGeM1TVPoHNkSnHqeQ499pY+GOOxbY3EM5uC6o4H\r\nDeBmTwOUkW++Z6G3YUjnQreiFIM6HViBGhG1RwIDAQABAoIBAQDLOmPJkVd7HHvz\r\nZiwOJmxHlmVeB18sbBVrOg4tEXNWvdxNNr9289mbsCml6+SQ2B4g94FKNLIb4A5x\r\nFFqtUqd8iHAi5E3L3lqUWxu7514hleLeO5hzS5H9PwLOZhRXHm6K53mfnTKqZmMu\r\nMIeQ47R8Ca+Yh7HYRp5iWgNEM3YIomSPTjxRW1JmCZvJXqS2i/R8Qz8xfliflukk\r\nxsqWRV3EzrXgCjQ3xdx23qWualdWLz8HXFyNlMnY1cnKYZx3+z6AUn9lbCyhOZIs\r\nqbR6gHpZYhNumVHhJXFSso2BL5BBC/8OyGBAtb5uqGReTzXVfg4bPUeROpQUwnla\r\neukv2KFBAoGBAP7vDUy8ptzCVey8oieHgSblpQ2Aq8euy0ZnrHIbo9pc/SakqYsb\r\n7eqB8Xv9pgu/RlC7IL5k2WAhclkA+FYNZ8ADuJ/ST2hncb8mmCjj2/UHK+g1qKav\r\nVzcvihj4VZe3sBy+bvKNwMstALC5ESWQITej4Wx4vra7W7S7RErzg27fAoGBAOKF\r\nMCIcsNqWPB+yoScLrDXl9g6vIKBWoc6aSwW+TTLG80kAKxZZXly+2UDqgJ59vyqj\r\nAYqgvpLSrbC8P0oLRKUPeGgVGaBgA4qtKFddlRtiTFpT/ab6+YFr/s3XPMff6w1C\r\nlUJrh1aTAYqfAC5evj3mdS+PvhqBudWxxNWFU86ZAoGAKeP8KnzhamsglWsVtisl\r\nBNA9g+99yq0lR+dnRcTW8t3O11e9aFdpi9xYYwh2DX4bvs5Q/hgyRAKa+JcZN4Ky\r\nZrH114VGeSBuZ3ufCzEOBsBr7ZdLpEAxs6bDKYE9B1YuwTplnsO+R2SYtXFjqOl7\r\nG9p5A0sAA6Tb1+HhwfMryL8CgYALoleUiPC0aV7xKdWJEdpockUu/+OnGIv69oW/\r\n58RDRWCdcTrFTRXBobO619B/U2oMII8ltZfUJqnxF9oQTX/bEm5Wui60w/mql7Yo\r\nto+/9k6BnSq79sv1z7woilN+2ItUBQVxgeBTm/1KR1xVBVy0BTAjnzheWCdZSGYZ\r\nqV1ikQKBgQCIUdAvEJF8y1Ka28CMVCpk9DP3WQxMa+85qccP9KWb+SyJN6zqbcgh\r\nyO1q44vJXs30KAbZnYW8WfmizbrhrYVAU/6EuoRxdwDSFILl6r83j6/9nTspED2q\r\nkkYpwB0+geqzXmanwkVAvdrId1gEz5YnK1L+riR2VzLsM1rhCUan+Q==\r\n-----END RSA PRIVATE KEY-----\r\n";
  const afip = new Afip({
    CUIT: taxId,
    cert: cert,
    key: key,
  });

  return afip;
}

export function FacturaDialog() {
  async function generateFactura() {
    (async () => {
      const afip = await ingresarAfip();
      const last_voucher = await afip.ElectronicBilling.getLastVoucher(
        puntoVenta,
        tipoFactura,
      );
      const numero_de_factura = last_voucher + 1;

      const fecha = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000,
      )
        .toISOString()
        .split("T")[0];

      let fecha_servicio_desde = null,
        fecha_servicio_hasta = null,
        fecha_vencimiento_pago = null;

      if (concepto === "2" || concepto === "3") {
        /**
         * Fecha de inicio de servicio en formato aaaammdd
         **/
        const fecha_servicio_desde = 20191213;

        /**
         * Fecha de fin de servicio en formato aaaammdd
         **/
        const fecha_servicio_hasta = 20191213;

        /**
         * Fecha de vencimiento del pago en formato aaaammdd
         **/
        const fecha_vencimiento_pago = 20191213;
      }

      const data = {
        CantReg: 1, // Cantidad de facturas a registrar
        PtoVta: puntoVenta,
        CbteTipo: tipoFactura,
        Concepto: concepto,
        DocTipo: tipoDocumento,
        DocNro: nroDocumento,
        CbteDesde: numero_de_factura,
        CbteHasta: numero_de_factura,
        CbteFch: parseInt(fecha?.replace(/-/g, "") ?? ""),
        FchServDesde: fecha_servicio_desde,
        FchServHasta: fecha_servicio_hasta,
        FchVtoPago: fecha_vencimiento_pago,
        ImpTotal: importe,
        ImpTotConc: 0, // Importe neto no gravado
        ImpNeto: importe,
        ImpOpEx: 0,
        ImpIVA: 0,
        ImpTrib: 0, //Importe total de tributos
        MonId: "PES", //Tipo de moneda usada en la factura ('PES' = pesos argentinos)
        MonCotiz: 1, // Cotización de la moneda usada (1 para pesos argentinos)
      };

      /**
       * Creamos la Factura
       **/
      const res = await afip.ElectronicBilling.createVoucher(data);

      /**
       * Mostramos por pantalla los datos de la nueva Factura
       **/
      console.log({
        cae: res.CAE, //CAE asignado a la Factura
        vencimiento: res.CAEFchVto, //Fecha de vencimiento del CAE
      });
    })();
  }
  const [puntoVenta, setPuntoVenta] = useState("");
  const [tipoFactura, setTipoFactura] = useState("");
  const [concepto, setConcepto] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("");
  const [nroDocumento, setNroDocumento] = useState("");
  const [importe, setImporte] = useState("");
  const [fechaServicioDesde, setFechaServicioDesde] = useState("");
  const [fechaServicioHasta, setFechaServicioHasta] = useState("");
  const [fechaVencimientoPago, setFechaVencimientoPago] = useState("");

  const [isLoading, setLoading] = useState(false);
  const [reducedDescription, setReducedDescription] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusCircleIcon className="mr-2" size={20} />
        Crear marca
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Crear nueva factura</DialogTitle>
          </DialogHeader>
          <div>
            <Label htmlFor="name">Punto de venta a utilizar</Label>
            <Input
              id="puntoVenta"
              placeholder="..."
              value={puntoVenta}
              onChange={(e) => setPuntoVenta(e.target.value)}
              required
            />
          </div>
          {/* CODIGO  : TIPO DE FACTURA
          FACTURAS
          3       : FACTURA A
          6       : FACTURA B
          11      : FACTURA C
          51      : FACTURA M
          19      : FACTURA E

          NOTAS DE DEBITO
          8       : FACTURA A
          13      : FACTURA B
          15      : FACTURA C
          52      : FACTURA M
          20      : FACTURA E

          NOTAS DE CREDITO
          2       : FACTURA A
          12      : FACTURA B
          14      : FACTURA C
          53      : FACTURA M
          21      : FACTURA E */}

          <div>
            <Label htmlFor="factura">Codigo de tipo de factura a generar</Label>
            <Input
              id="factura"
              placeholder="..."
              value={tipoFactura}
              onChange={(e) => setTipoFactura(e.target.value)}
            />
          </div>
          {/* Opciones:
            
            1 = Productos 
            2 = Servicios 
            3 = Productos y Servicios */}
          <div>
            <Label htmlFor="concepto">Concepto de la factura</Label>
            <Input
              id="concepto"
              placeholder="..."
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
            />
          </div>

          {/* Tipo de documento del comprador
	 
            Opciones:
            
            80 = CUIT 
            86 = CUIL 
            96 = DNI
            99 = Consumidor Final  */}

          <div>
            <Label htmlFor="tipoDocumento">Tipo de documento</Label>
            <Input
              id="tipoDocumento"
              placeholder="..."
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value)}
            />
          </div>

          {/* Numero de documento del comprador (0 para consumidor final) */}

          <div>
            <Label htmlFor="nroDocumento">Numero de documento</Label>
            <Input
              id="nroDocumento"
              placeholder="..."
              value={nroDocumento}
              onChange={(e) => setNroDocumento(e.target.value)}
            />
          </div>

          {/* Importe de la Factura */}
          <div>
            <Label htmlFor="importe">Importe total de la factura</Label>
            <Input
              id="importe"
              placeholder="..."
              value={importe}
              onChange={(e) => setImporte(e.target.value)}
            />
          </div>
          {/* Los siguientes campos solo son obligatorios para los conceptos 2 y 3 */}

          <div>
            <Label htmlFor="fechaDesde">Fecha de inicio del servicio</Label>
            <Input
              id="fechaDesde"
              placeholder="..."
              value={fechaServicioDesde}
              onChange={(e) => setFechaServicioDesde(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="fechaHasta">Fecha de fin del servicio</Label>
            <Input
              id="fechaHasta"
              placeholder="..."
              value={fechaServicioHasta}
              onChange={(e) => setFechaServicioHasta(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="fechaVencimiento">
              Fecha de vencimiento del pago
            </Label>
            <Input
              id="fechaVencimiento"
              placeholder="..."
              value={fechaVencimientoPago}
              onChange={(e) => setFechaVencimientoPago(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button disabled={isLoading} onClick={generateFactura}>
              {isLoading && (
                <Loader2Icon className="mr-2 animate-spin" size={20} />
              )}
              Crear marca
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
