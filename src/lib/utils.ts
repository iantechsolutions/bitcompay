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
  factura: RouterOutputs["facturas"]["list"][number],
  company: RouterOutputs["companies"]["list"][number],
  producto: RouterOutputs["products"]["get"],
  madeDate: Date,
  due_date: Date,
  fromPeriod: Date,
  toPeriod: Date
) {
  const billResponsible = factura.family_group?.integrants?.find(
    (x) => x.isBillResponsible
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
  function getTextoForTipoFactura(tipoFactura: string): string {
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
            ${company.razon_social}<br />
            ${company.address} <br />
            ${company.afip_condition}
          </p>
        </div>
  
        <div class="items-2">
              ${getImageTagForTipoFactura(factura.tipoFactura ?? "")}
          <img
            src="https://utfs.io/f/8ab5059a-71e9-4cb2-8e0c-4743f73c8fe5-kmcofx.png"
            alt=""
          />
        </div>
  
        <div class="items-3">
          <h2>
            ${getTextoForTipoFactura} <br />
            ${factura.nroFactura}
          </h2>
          <p>
            Fecha: ${dateNormalFormat(madeDate)} <br />
            C.U.I.T: ${company.cuit} <br />
            Ing. Brutos Conv.Multil: ${company.cuit} <br />
            Fecha de Inicio de Actividad: ${company.activity_start_date}
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
            <p>Provincia: ${billResponsible?.state}</p>
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
            <p>Periodo facturado:${dateNormalFormat(fromPeriod)}</p>
          </li>
          <li>
            <p>Fecha de vencimiento:${dateNormalFormat(due_date)}</p>
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
    (fromPeriod.getMonth() + 1).toString() + "/" + fromPeriod.getFullYear()
  }</p>
          <p>Bonificacion: ${
            factura.family_group?.bonus?.filter(
              (x) =>
                (x.from?.getTime() ?? 0) < new Date().getTime() &&
                new Date().getTime() < (x.to?.getTime() ?? 0)
            )[0]?.amount ?? "0"
          }%</p>
          <p>Aportes</p>
          <p>Factura periodo anterior impaga</p>
          <p>Interes por pago fuera de termino</p>
          <p>Pago a cuenta</p>
        </div>
  
        <div>
          <p>$ ${formatNumberAsCurrency(factura.items?.abono ?? 0)}</p>
          <p>$ ${formatNumberAsCurrency(factura.items?.bonificacion ?? 0)}</p>
          <p>$ ${formatNumberAsCurrency(factura.items?.contribution ?? 0)}</p>
          <p>$ ${formatNumberAsCurrency(factura.items?.previous_bill ?? 0)}</p>
          <p>$ ${formatNumberAsCurrency(factura.items?.interest ?? 0)}</p>
          <p>$ --- </p>
        </div>
      </section>
  
      <section class="parte-4">
        <p>Pesos Doscientos sesenta mil noventa y cuatro con 85/100</p>
        <p><span>TOTAL: </span> $ ${formatNumberAsCurrency(
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
