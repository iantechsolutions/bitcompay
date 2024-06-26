import Afip from "@afipsdk/afip.js";
import { type ClassValue, clsx } from "clsx";
import { fi } from "date-fns/locale";
import { nanoid } from "nanoid";
import { twMerge } from "tailwind-merge";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function nameInitials(name: string) {
  const [firstName, lastName] = name.split(" ");
  return `${firstName?.[0] ?? ""}${lastName ? lastName[0] : ""}`;
}

export function createId() {
  return nanoid();
}

export function formatKB(bytes: number) {
  return `${(bytes / 1000).toFixed(1)} KB`;
}

export function computeIva(field: number, iva: number): number {
  return parseFloat(((field * iva) / (100 + iva)).toFixed(2));
}

export function computeBase(field: number, iva: number): number {
  return parseFloat((field - computeIva(field, iva)).toFixed(2));
}

export function computeTotal(field: number, iva: number): number {
  return parseFloat(((field * (100 + iva)) / 100).toFixed(2));
}

export function calcularEdad(fechaNacimiento: Date): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mes = hoy.getMonth() - fechaNacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--;
  }

  return edad;
}

export function formatDate(date: Date | undefined) {
  if (date) {
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return year + month + day;
  }
  return null;
}

export function dateNormalFormat(date: Date | undefined) {
  if (date) {
    const yyyy = date.getFullYear();
    let mm = date.getMonth() + 1; // Months start at 0!
    let dd = date.getDate();
    let dia = dd.toString();
    let mes = mm.toString();
    if (dd < 10) {
      const dia = "0" + dd.toString();
    }
    if (mm < 10) {
      const mes = "0" + mm.toString();
    }

    const formattedDate = dia + "/" + mes + "/" + yyyy;
    return formattedDate;
  }
  return null;
}

export const topRightAbsoluteOnDesktopClassName =
  "md:absolute md:top-0 md:right-0 mr-10 mt-10";

export function htmlBill(
  factura: any,
  company: any,
  producto: any,
  voucher: number
) {
  const billResponsible = factura.family_group?.integrants?.find(
    (x: any) => x.isBillResponsible
  );
  const canales = producto?.channels;
  function formatNumberAsCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  }
  function getImageTagForTipoFactura(tipoFactura: string): string {
    switch (tipoFactura) {
      case "6":
      case "13":
      case "12":
        return `<img src="https://utfs.io/f/8ab5059a-71e9-4cb2-8e0c-4743f73c8fe5-kmcofx.png" alt="" />`;
      case "14":
      case "15":
      case "11":
        return `C`;
      default:
        return "X";
    }
  }
  function getTextoForTipoFactura(tipoFactura: string) {
    switch (tipoFactura) {
      case "3":
      case "6":
      case "11":
      case "51":
      case "19":
        return "FACTURA";
      case "8":
      case "13":
      case "15":
      case "52":
      case "20":
        return "NOTA DE DEBITO";
      case "2":
      case "12":
      case "14":
      case "53":
      case "21":
        return "NOTA DE CREDITO";
      default:
        return "";
    }
  }
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
  font-size: 10px;

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
  font-size: 15px;

  font-weight: 500;
  color: #323232;
  line-height: 25px;
}

.items-3 p {
  font-size: 10px;

  font-weight: 400;
  color: #303030;
  line-height: 20px;
}

.items-3 span {
  font-size: 13px;

}

.parte-2 {
  display: flex;
  justify-content: space-between;
  border-top: none;
  border-bottom: 1px solid #8fefdc;
}

.datos-1 {
  font-size: 10px;

  font-weight: 480;
  margin: 10px 10px 10px 0;
  list-style-type: none;
  line-height: 30px;
}

.datos-2 {
  font-size: 13px;

  font-weight: 480;
  list-style-type: none;
  line-height: 30px;
  margin: 10px 10px 10px 0;
}

span {
  font-weight: 400;
  color: rgb(173, 171, 171);
}

.parte-3 {
  display: flex;
  justify-content: space-between;
  border-top: none;
  border-bottom: 1px solid #8fefdc;
}

.parte-3 p {
  font-size: 12px;

  font-weight: 600;
  margin: 7px;
  color: #323232;
}

.parte-5 {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #8fefdc;
  padding-bottom: 20px;
}

.parte-5 p {
  font-size: 13px;

  line-height: 20px;
  margin: 10px 0 0 0;
}

.parte-4 {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #8fefdc;
}

.parte-4 p {
  font-size: 13px;

  font-weight: 500;
  color: #323232;
  margin: 5px 0 5px 0;
}

.parte-4 p span {
  text-decoration: none;
  font-weight: 600;
}

.parte-6 h2 {
  margin-top: 10px;
  font-size: 13px;

  font-weight: 500;
}

.parte-6 p {
  font-style: oblique;
  margin-top: 10px;
}

.logos {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding: 2px;
  border: 2px dashed #8fefdc;
}

.pago-facil {
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
  margin-top: 10px;
  margin-bottom: 5px;
  font-weight: 400;
  font-size: 12px;

  font-style: oblique;
}

.cbu-section-2 {
  display: flex;
  justify-content: space-between;
  border: 2px dashed #8fefdc;
  padding: 10px;
}

.cbu-section-2 p {
  font-size: 17px;

  font-weight: 550;
  margin-right: 50px;
}

.pago-mis {
  height: 30px;
  width: 200px;
}

.cards h2 {
  margin-top: 10px;
  margin-bottom: 5px;
  font-weight: 400;
  font-size: 12px;

  font-style: oblique;
}

.cards-section {
  display: flex;
  justify-content: space-between;
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
  margin-top: 10px;
  border: 2px dashed #8fefdc;
  padding: 2px;
}

.factura-vencimiento p {
  font-style: oblique;
  font-size: 12px;

  font-weight: 550;
}

.qr-section {
  font-size: 12px;

  line-height: 20px;
  gap: 10px;
  display: flex;
  margin-top: 20px;
}

.qr {
  width: 150px;
}

.cae-section {
  flex-direction: column;
}

.bold {
  font-weight: 500;
}

.afip {
  width: 150px;
}

.bp-logo {
  width: 80px;
  vertical-align: middle;
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
            ${company.razon_social}<br />
            ${company.address} <br />
            ${company.afip_condition}
          </p>
        </div>
  
        <div class="items-2">
              ${getImageTagForTipoFactura(factura.tipoFactura ?? "")}
         
        </div>
  
        <div class="items-3">
          <h2>
            ${getTextoForTipoFactura(factura.tipoFactura ?? "")} <br />
            N° ${factura.ptoVenta.toString().padStart(4, "0")}-${voucher
    .toString()
    .padStart(8, "0")}
          </h2>
          <p>
            Fecha: ${dateNormalFormat(new Date())} <br />
            C.U.I.T: ${company.cuit} <br />
            Ing. Brutos Conv.Multil: ${company.cuit} <br />
            Fecha de Inicio de Actividad: ${dateNormalFormat(
              company.activity_start_date
            )}
          </p>
        </div>
      </header>
  
      <section class="parte-2">
        <ul class="datos-1">
          <li>
            <p>Cliente: ${billResponsible?.name}</p>
          </li>
          <li>
            <p>Domicilio: ${billResponsible?.address}</p>
          </li>
          <li>
            <p>Localidad: ${billResponsible?.locality}</p>
          </li>
          <li>
            <p>Provincia: ${billResponsible?.partido}</p>
          </li>
          <li>
            <p>CP: ${billResponsible?.postal_code?.cp}</p>
          </li>
        </ul>
  
        <ul class="datos-2">
          <li>
            <p>C.U.I.T:: ${billResponsible?.fiscal_id_number}</p>
          </li>
          <li>
            <p>Categoria I.V.A: ${billResponsible?.afip_status}</p>
          </li>
          <li>
            <p>Condicion de Venta: ---</p>
          </li>
          <li>
            <p>Periodo facturado:${dateNormalFormat(factura.fromPeriod)}</p>
          </li>
          <li>
            <p>Fecha de vencimiento:${dateNormalFormat(factura.due_date)}</p>
          </li>
        </ul>
      </section>
  
      <section class="parte-3">
        <p>CONCEPTOS</p>
        <p>IMPORTE</p>
      </section>
  
      <section class="parte-5">
        <div>
          <p>Plan de salud ${
            factura.family_group?.plan?.plan_code
          } -- Periodo ${
    (factura.fromPeriod.getMonth() + 1).toString() +
    "/" +
    factura.fromPeriod.getFullYear()
  }</p>
          <p>Bonificacion: ${
            factura?.items?.bonificacion / factura?.items?.abono
          }%</p>
          <p>Aportes</p>
          <p>Factura periodo anterior impaga</p>
          <p>Interes por pago fuera de termino</p>
          <p>Pago a cuenta</p>
        </div>
  
        <div>
          <p> ${formatNumberAsCurrency(factura.items?.abono ?? 0)}</p>
          <p> -${formatNumberAsCurrency(factura.items?.bonificacion ?? 0)}</p>
          <p> ${formatNumberAsCurrency(factura.items?.contribution ?? 0)}</p>
          <p> ${formatNumberAsCurrency(
            factura.items?.previous_bill * -1 ?? 0
          )}</p>
          <p> ${formatNumberAsCurrency(factura.items?.interest ?? 0)}</p>
          <p> ${formatNumberAsCurrency(factura.items?.account_payment ?? 0)}</p>
        </div>
      </section>
  
      <section class="parte-4">
        <p>Pesos ${numeroALetras(Math.floor(factura.importe))} ${
    obtenerDecimales(factura.importe) == "00" || "0"
      ? ""
      : `con ${obtenerDecimales(factura.importe)}/100`
  }</p>
        <p><span>TOTAL: </span>${formatNumberAsCurrency(
          factura.importe ?? 0
        )}</p>
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

function numeroALetras(numero: number): string {
  const unidades = [
    "",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
  ];
  const decenas = [
    "",
    "diez",
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa",
  ];
  const centenas = [
    "",
    "cien",
    "doscientos",
    "trescientos",
    "cuatrocientos",
    "quinientos",
    "seiscientos",
    "setecientos",
    "ochocientos",
    "novecientos",
  ];
  const especiales = [
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciséis",
    "diecisiete",
    "dieciocho",
    "diecinueve",
  ];
  if (numero === 0) return "cero";
  if (numero < 10) return unidades[numero]!;
  if (numero >= 11 && numero < 20) return especiales[numero - 11]!;
  if (numero < 100)
    return (
      decenas[Math.floor(numero / 10)] +
      (numero % 10 !== 0 ? " y " + unidades[numero % 10] : "")
    );
  if (numero < 1000) {
    let centena = Math.floor(numero / 100);
    let resto = numero % 100;
    if (resto === 0 && centena === 1) return "cien";
    return centenas[centena] + (resto !== 0 ? " " + numeroALetras(resto) : "");
  }
  if (numero < 1000000) {
    let miles = Math.floor(numero / 1000);
    let resto = numero % 1000;
    if (miles === 1)
      return "mil" + (resto !== 0 ? " " + numeroALetras(resto) : "");
    return (
      numeroALetras(miles) +
      " mil" +
      (resto !== 0 ? " " + numeroALetras(resto) : "")
    );
  }
  if (numero < 100000000) {
    let millones = Math.floor(numero / 1000000);
    let resto = numero % 1000000;
    if (millones === 1)
      return "un millón" + (resto !== 0 ? " " + numeroALetras(resto) : "");
    return (
      numeroALetras(millones) +
      " millones" +
      (resto !== 0 ? " " + numeroALetras(resto) : "")
    );
  }
  return "Número fuera de rango";
}

function obtenerDecimales(numero: number) {
  let numeroStr = numero.toString();
  let partes = numeroStr.split(".");
  if (partes.length === 2) {
    let decimales = partes[1]!.substring(0, 2); // Obtiene los dos primeros decimales
    return decimales.padEnd(2, "0"); // Asegura que siempre haya dos dígitos
  }
  return "00"; // Retorna "00" si no hay parte decimal
}
