"use client";
import Afip from "@afipsdk/afip.js";
import { set } from "zod";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import path from "path";
import { FacturaDialog } from "./generarFactura";
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

export async function crearFactura(html: String) {
  const afip = await ingresarAfip();
  (async () => {
    console.log("Creando factura");

    console.log(html);
    // Nombre para el archivo (sin .pdf)
    const name = "PDF de prueba";

    // Opciones para el archivo
    const options = {
      width: 8, // Ancho de pagina en pulgadas.
      marginLeft: 0.4, // Margen izquierdo en pulgadas.
      marginRight: 0.4, // Margen derecho en pulgadas.
      marginTop: 0.4, // Margen superior en pulgadas.
      marginBottom: 0.4, // Margen inferior en pulgadas.
    };
    console.log("pre crear");
    // Creamos el PDF
    const res = await afip.ElectronicBilling.createPDF({
      html: html,
      file_name: name,
      options: options,
    });
    console.log("creado");
    // Mostramos la url del archivo creado
    console.log(res.file);
  })();
}

export async function getInfo() {
  console.log("pre");
  const afipSession = await ingresarAfip();
  console.log("post");
  //   const salesPoints = await afipSession.ElectronicBilling.getSalesPoints();
  //   console.log(salesPoints);
  const voucherTypes = await afipSession.ElectronicBilling.getVoucherTypes();
  console.log(voucherTypes);
  const conceptTypes = await afipSession.ElectronicBilling.getConceptTypes();
  console.log(conceptTypes);
  const documentTypes = await afipSession.ElectronicBilling.getDocumentTypes();
  console.log(documentTypes);
  const aloquotTypes = await afipSession.ElectronicBilling.getAliquotTypes();
  console.log(aloquotTypes);
  const currenciesTypes =
    await afipSession.ElectronicBilling.getCurrenciesTypes();
  console.log(currenciesTypes);
  const optionTypes = await afipSession.ElectronicBilling.getOptionsTypes();
  console.log(optionTypes);
  const taxTypes = await afipSession.ElectronicBilling.getTaxTypes();
  console.log(taxTypes);
}

interface FacturaProps {
  receivedHtml: string;
}

export default async function Factura({ receivedHtml }: FacturaProps) {
  return (
    <div>
      <h1>Facturas</h1>
      <Button onClick={() => getInfo()}>Obtener info</Button>
      <Button onClick={() => crearFactura(receivedHtml)}>Crear factura</Button>
    </div>
  );
}
