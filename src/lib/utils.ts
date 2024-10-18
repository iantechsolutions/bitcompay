import Afip from "@afipsdk/afip.js";
import { type ClassValue, clsx } from "clsx";
import { sub } from "date-fns";
import { fi } from "date-fns/locale";
import { InferSelectModel } from "drizzle-orm";
import { nanoid } from "nanoid";
import { twMerge } from "tailwind-merge";
import { number } from "zod";
import BarcodeProcedure from "~/components/barcode";
import { schema } from "~/server/db";
import { FamilyGroup } from "~/server/db/schema";
import { api } from "~/trpc/server";
import { RouterOutputs } from "~/trpc/shared";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
dayjs.extend(utc);
dayjs.locale("es");

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toNumberOrZero = (value: any) => {
  const number = Number(value);
  return isNaN(number) ? 0 : number; // Check if the result is NaN (Not a Number)
};

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

type usedDates = "hh:mm" | "dd/mm/yyyy";
export function formatDatejs(
  date: Date | undefined | null,
  format?: usedDates
): string {
  if (!date) return "No hay fecha disponible";
  if (format === "hh:mm") return dayjs.utc(date).format("DD/MM/YYYY hh:mm");
  return dayjs.utc(date).format("DD/MM/YYYY");
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

export function dateNormalFormat(date: Date | undefined | null) {
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
  return "Sin Fecha";
}

export const topRightAbsoluteOnDesktopClassName =
  "md:absolute md:top-0 md:right-0 mr-10 mt-10";

export function formatNumberAsCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  }).format(amount);
}

let comprobanteCortado = "ss";

function getTagForTipoComprobante(tipoComprobante: string): string {
  comprobanteCortado = tipoComprobante;
  if (tipoComprobante.includes(" A")) {
    comprobanteCortado = comprobanteCortado.replace(" A", "");
    return "A";
  } else if (tipoComprobante.includes(" B")) {
    comprobanteCortado = comprobanteCortado.replace(" B", "");
    return "B";
  } else {
    return "X";
  }
}

function getIimageForLogo(logo: string | null) {
  if (logo) {
    return `<img class="logo" style="height:180px width:50" src=${logo} alt="logo" />`;
  } else {
    return `<img class="logo" style="height:180px width:50" src="https://utfs.io/f/f426d7f1-f9c7-437c-a722-f978ab23830d-neiy4q.png" alt="logo" />`;
  }
}

function getIimageForBarcode() {
  // const barcode = BarcodeProcedure({
  //   dateVto: comprobante.first_due_date ?? new Date(),
  //   amountVto: comprobante.first_due_amount ?? 0,
  //   client: comprobante.fiscal_id_number ?? 0,
  //   isPagoFacil: false,
  //   invoiceNumber: comprobante.invoice_number ?? 0,
  // });
  return "barcode";

  // if (barcode != undefined) {
  //   return `<img
  //   class="cod-barras"
  //   src="${barcode}
  //   alt="barcode"
  // />`;
  // } else {
  //   return `<img
  //         class="cod-barras"
  //         src="https://utfs.io/f/73e104e8-fb1f-490f-a30e-7de1608ef3ac-12ad.png"
  //         alt=""
  //       />`;
  // }
}

function generateConcepts(
  items: Array<{ concept: string | null; total: number | null;amount:number | null }>
): string {
  // let bonoTotal = 0;

  // items.forEach((item) => {
  //   if (item.concept === "bono") {
  //     bonoTotal += item.total ?? 0;
  //   }
  // });

  // for (const item of items) {
  //   if (item.concept === "Diferencial" && item.total) {
  //     item.total += bonoTotal;
  //   }
  // }

  items = items.sort((a, b) => (a.total ?? 0) - (b.total ?? 0));
  return items
    .map((item) => {
      if (item.concept === "Diferencial" || item.concept === "Saldo a favor" || item.concept === "Total factura" || item.amount===0) return "";
      return `<p>${item.concept}</p>`;
    }).join("");
}

function generateAmounts(
  items: Array<{ concept: string | null; total: number | null; amount: number | null }>
): string {
  const diferencial =
    items.find((x) => x.concept === "Diferencial");
  
  const abonoTotal = items
  .filter((x) => x.concept === "Abono")
  .reduce((acc, item) => acc + (item.total ?? 0), 0);

  const abonoAmount = items
  .filter((x) => x.concept === "Abono")
  .reduce((acc, item) => acc + (item.amount ?? 0), 0);

  items = items.filter((x) => x.concept !== "Abono");
  items.push({ concept: "Abono", total: abonoTotal + (diferencial?.total ?? 0), amount: abonoAmount + (diferencial?.amount ?? 0)});
  items = items.sort((a, b) => (a.total ?? 0) - (b.total ?? 0));
  return items.map((item) => {
    if (item.concept === "Saldo a favor" || item.concept=="Diferencial" ||  item.concept === "Total factura" || item.amount === 0) return "";
    return ((`<p>${formatNumberAsCurrency(item.amount ?? 0)}</p>`))
  }).join("");
}


function getTextoForTipoComprobante(tipoComprobante: string) {
  switch (tipoComprobante) {
    case "1":
    case "6":
    case "11":
    case "51":
    case "19":
      return "FACTURA";
    case "2":
    case "7":
    case "12":
    case "52":
    case "20":
      return "NOTA DE DEBITO";
    case "3":
    case "8":
    case "13":
    case "53":
    case "21":
      return "NOTA DE CREDITO";
    default:
      return "";
  }
}

function alturaConceptosTable(tipoComprobante: string) {
  if (tipoComprobante.includes("FACTURA")) return "height: 280px;";
  else if (tipoComprobante.includes("NOTA DE")) return "height: 450px;";
  else return "height: 350px;";
}

export function htmlBill(
  comprobante: any,
  company: any,
  producto: any,
  voucher: number,
  brand: /* outerOutputs["brands"]["list"][number] */InferSelectModel<typeof schema.brands> | undefined,
  name: string,
  domicilio: string,
  localidad: string,
  provincia: string,
  cp: string,
  sellCondition: string,
  id_type: string,
  id_number: string,
  afip_status: string,
  cbu: string,
) {
  let subtotal = 0;
  let iva = 0;
  if (comprobante.items.filter((x: any) => x.concept !== "Saldo a favor" && x.concept !== "Total factura").length > 0) {
    subtotal = comprobante.items.filter((x: any) => x.concept !== "Saldo a favor" && x.concept !== "Total factura").reduce(
      (acc: number, item: { amount: number }) => acc + (item?.amount ?? 0),
      0
    );
    iva = comprobante?.items.filter((x: any) => x.concept !== "Saldo a favor" && x.concept !== "Total factura").reduce(
      (acc: number, item: { iva: number }) => acc + (item?.iva ?? 0),
      0
    );
  }

  let totalTributes = 0;

  if (comprobante.otherTributes.length > 0) {
    totalTributes = comprobante.otherTributes.reduce(
      (acc: number, tribute: { amount: number }) =>
        acc + (tribute?.amount ?? 0),
      0
    );
  }

  const total = subtotal + iva + totalTributes;

  // const tribute = comprobante?.otherTributes.reduce(
  //   (acc: number, tribute: { tribute: string }) => acc + (tribute?.tribute ?? 0),
  //   0
  // )

  // const jurisdiction = comprobante?.otherTributes.reduce(
  //   (acc: number, tribute: {  jurisdiction: string }) => acc + (tribute?.jurisdiction ?? 0),
  //   0
  // )
  // const alicuota = comprobante?.otherTributes.reduce(
  //   (acc: number, tribute: { alicuota: number }) => acc + (tribute?.alicuota ?? 0),
  //   0
  // )
  // const base_imponible = comprobante?.otherTributes.reduce(
  //   (acc: number, tribute: { base_imponible: number }) => acc + (tribute?.base_imponible ?? 0),
  //   0
  // )
  // const tributeAmount = comprobante?.otherTributes.reduce(
  //   (acc: number, tribute: { amount: number }) => acc + (tribute?.amount ?? 0),
  //   0
  // )

  let canales: any;
  if (producto) {
    canales = producto?.channels;
  }
  if (comprobante) {
    const payment = comprobante.payments;
  }

  let saldoAfavor = comprobante?.items.find((x: any) => x.concept === "Saldo a favor");


  // console.log(voucher);

  // moví funciones porque es lento redefinirlas constantemente

  const conceptosList = generateConcepts(comprobante?.items ?? []);
  const amountsList = generateAmounts(comprobante?.items ?? []);
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
        font-family: "Open Sans", sans-serif;
      }

      body {
        padding: 1 rem;
        -webkit-print-color-adjust: exact; 
		print-color-adjust: exact;
    color: #3e3e3e
      }
      header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        border-bottom: 1.1px solid #D9D9D9;
        width: 100%;
      }
        
        .tribute-grid div {
padding-bottom:3px
}

        .items-1 {

        margin-left:30px;
        padding-bottom: 0;
      }

      .items-1 p {
        font-size: 11px;
        font-weight: 50;
        margin-bottom:5px;
      }

      .logo {
        width: 30vw;
        height: auto;
        margin-bottom: 5px;
      }

      .items-2 {
        position: relative;
	
      }

      .items-2 img {
        width: 60px;
        top: 0;
        left: 0;
      }

      .items-3 {
        padding-bottom: 1.1px;
        margin-right:30px;
        display: flex;
        flex-direction: column;
      }

      .items-3 div p {
        display: flex;
        font-size: 11px;
        font-weight: 50;
        margin-bottom:5px;
      }

      .parte-2 {
         display: flex;
        justify-content: space-between;
 	      font-size: 12px;
        flex-direction: column;
	      padding-top: 1.1px; 
        color: #3E3E3E;
      }
        .parte-2 div span {
        font-weight: 200;
        padding-bottom: 10px; 
      }
        .parte-2 div span span{
        font-weight: 600;
        margin-right:4px;
        letter-spacing: 0.025em;
      }



      .datos-1 {
        font-size: 16px;
        margin: 10px 10px 10px 0;
        list-style-type: none;
        line-height: 30px;
        color: #303030;
      }

      .datos-1 li p span {
        font-weight: 500;
        color: #303030;
        flex: 1;
    margin-right: 1rem;
      }

      .datos-2 {
        font-size: 16px;
        list-style-type: none;
        line-height: 30px;
        flex: 1;
        margin-right: 1rem;
        margin: 10px 10px 10px 0;
        color: #303030;
      }

      .datos-2 li p span {
        font-weight: 600;
        color: #303030;
      }

      .parte-3 {
        display: flex;
        justify-content: end;
        align: right;
        margin-bottom: 1rem; 
        border-top: none;
        border-bottom: 1.1px solid #D9D9D9;
      }

      .parte-3 p {
        font-size: 18px;
        font-weight: 500;
        margin: 7px;
      }

      .parte-5 {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem; 
        border-bottom: 1.1px solid #D9D9D9;
        padding-bottom: 20px;
        flex-direction: column;

      }

      .parte-5 p {
        font-size: 16px;
        color: #303030;
        font-weight: 600;
        line-height: 20px;
        margin: 10px 0 0 0;
      }

      .parte-4 {
        display: flex;
        justify-content: space-between;
        border-bottom: 1.1px solid #D9D9D9;
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
        font-size: 18px;

        font-weight: 500;
      }

      .parte-6 p {
        font-style: oblique;
        margin-top: 10px;
        font-style: bold;
      }

      .logos {
          display: flex;
    justify-content: space-around;
    align-items: center;
        margin-top: 10px;
        padding: 6px 12px;
        border: 2px dashed #8fefdc;
        flex-direction: column;

      }

      .cod-barras {
        width: 270px;
      }

      .qr-section {
        font-size: 10px;
        display: flex;
        justify-content: space-between;
        gap: 10px;
        display: flex;
        margin-top: 10px;
        margin-left: 30px;
    margin-right:30px;
      }

      .qr-section p{
      font-size: 10px;
      color: #3e3e3e;
      font-weight: 300;
      margin-bottom: 3px;
      }
      .qr {
        width: 160px;
      }

      .cae-section {
        flex-direction: column;
      }
      .cae-section p {
        font-size: 10px;
        line-height:15px;
        font-weight: 400;
        color: #333;
        margin-bottom:0;
        padding-bottom: 0;
	padding-left:6px;
      }

      .bold {
        font-weight: 500;
      }

      .afip {
        width: 160px;
      }

      .bp-logo {
        width: 80px;
        vertical-align: middle;
      }
      
      .info-tributo-contenedor {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 20px;
}
      
      .tabla-totales {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.tabla-totales th, .tabla-totales td {
  border:;
  padding: 8px;
  text-align: left;
}

.tabla-totales th {
  background-color: inherit;
}

.resumen-totales {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}

.resumen-totales .totales-info {
  font-size: 10x;
 text-align: right;
  width: 30%;
}

.resumen-totales .total-a-pagar {
  background-color: #DEF5DD;
  padding: 10px;
  text-align: right;
}

.total-a-pagar {
  background-color: #d9f7be;
  padding: 10px;
  text-align: right;
  justify: end;
}      
      
.total-a-pagar p {
  margin: 0;
}

.total-a-pagar .total {
  font-size: 24px;
  color: #6c63ff;
}



.icon {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    background-color: #f0f0f0;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 0;
}

.icon span {
    font-size: 30px;
    color: #3E3E3E;
    font-weight: bold;
}

.line {
    width: 1.1px;
    height: 40px;
    background-color: #D9D9D9;
    margin: 0 auto 0;
}

.grid {
	padding-right: 30px;
	padding-left: 30px
}

.grid div {
padding-bottom: 10px;
}

.conceptotables-container{
  margin-top: 10px;
  ${alturaConceptosTable(comprobante?.tipoComprobante)};
}

.conceptotables {
    width: 100%;
    border-collapse: collapse;
max-height:100%;
}


.conceptotables-header {
    padding-top: 10px;
	padding-bottom: 10px;
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 0.05em;
    color: #3E3E3E;
	background-color: #f1f1f1;
	border-style : hidden;
}

.conceptotables-cell p {
  padding-top: 10px;
  font-size: 13px;
}

.tributos {
padding-top: 15px;
border-top: 1.1px solid #D9D9D9;
padding-bottom: 0;
}
.tributos div {
padding-bottom: 0;
}
.tributos div p {
font-size:9px;
font-weight: 500; 
margin-bottom: 0;
padding-right: 10px;
}

.tributos div span {
font-size: 8px;
font-family: "Montserrat", sans-serif;
font-weight: 200; 
margin: 0;
padding: 0;
}

	.resumen-total {
		background-color: #DEF5DD;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		padding-bottom: 10px;
		padding-top: 10px;
		border-radius: 5px
		
	}
.payment {
  position: relative;
  border-width: 0.25px;
  border-style: solid;
  border-radius: 0.75rem;
  border-color: #D9D9D9;
  display: flex;
  justify-content: space-evenly;
  gap: 1rem;
  padding: 0.5rem 1rem;
  place-items: center;
  height: 40px;
}

      .payment span{
        position: absolute;
        font-size:10px;
        background-color: #FFFFFF;
        top: -8px;
        padding: 0 8px;
        white-space:nowrap;
        color:#3E3E3E;
}
    </style>
    </head>
    <body>
      <header style="margin-bottom:10px">
        <div class="items-1">
        ${getIimageForLogo(brand?.logo_url ?? null)}
          <p>${company.razon_social}</p>
            <p>${company.address}</p>
            <p>${company.afip_condition}</p>
        </div>
  
          <div class="items-2" style="text-align:center">
          <div style="font-size: 15px; font-weight: 300; padding-bottom:12px; letter-spacing: 0.025em;"> ORIGINAL </div>
        <div class="icon">
				<span>${getTagForTipoComprobante(comprobante?.tipoComprobante ?? "")}</span>
			  </div>
			<div class="line"></div>
        </div>
  
        <div class="items-3" style="padding-bottom: 5px;">
          <div>
           <h3 style=" font-size: 16px; font-weight:600; padding-bottom:4px; letter-spacing: 0.05em;">
            ${comprobanteCortado ?? ""} </h3>
           <h3 style=" font-size: 14px; font-weight:450; padding-bottom:5px;">
            N° ${comprobante?.ptoVenta.toString().padStart(4, "0")}-${voucher
    .toString()
    .padStart(8, "0")}
          </h3>

          <p> Fecha de Emisión: ${dateNormalFormat(new Date())}</p>
          	<p> C.U.I.T: ${company.cuit}</p>
            <p> Ingresos Brutos: 0</p>
          <p style="margin-bottom:3px;"> Fecha de Inicio de Actividad: ${dateNormalFormat(
            company.activity_start_date
          )}</p>
        </div>
      </header>
  
    <div class="parte-2">	
		  <div class="grid" style="display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1.1px solid #D9D9D9; white-space: nowrap;">
        <div style="grid-column: 1 / span 1;">
          <span><span>Nombre/Razón Social:</span> ${name}</span>
        </div>
        <div style="padding-left: 220px; grid-column: 2 / span 1;">
          <span><span>${id_type}:</span> ${id_number}</span>
        </div>
        <div style="grid-column: 1 / span 2;">
          <span><span>Domicilio:</span> ${domicilio} ${localidad} ${cp} ${provincia}</span>
        </div>
        <div style="grid-column: 1 / span 1;">
          <span><span>Condición de AFIP:</span> ${afip_status}</span>
        </div>
        <div style="padding-left: 220px; grid-column: 2 / span 1;">
          <span><span>Condición de venta:</span> ${sellCondition}</span>
        </div>
        <div style="grid-column: 1 / span 1;">
          <span><span>Período:</span> ${dateNormalFormat(
            comprobante?.fromPeriod
          )}</span>
        </div>
        <div style="padding-left: 220px; grid-column: 2 / span 1;">
          <span><span>Fecha de vencimiento:</span> ${dateNormalFormat(
            comprobante?.due_date
          )}</span>
        </div>
      </div>
</div>

  
    <div class="conceptotables-container">
        <table class="conceptotables">
            <thead>
                <tr>
                    <th class="conceptotables-header" style="text-align:left;padding-left: 30px;background-color: #f0f0f0;border-top-left-radius:5px;border-bottom-left-radius:5px" >Conceptos</th>
                    <th class="conceptotables-header" style="text-align:right; padding-right:30px;border-top-right-radius:5px;border-bottom-right-radius:5px">Importe</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="conceptotables-cell" style="text-align:left;padding-left: 30px;"> ${conceptosList}</td>
                     <td class="conceptotables-cell" style="text-align:right; padding-right:30px;">${amountsList}</td>
                </tr>
            </tbody>
        </table>
    </div>


       <div class="tributos" style="display:flex; flex-direction: row;justify-content:space-between; padding-left: 30px; padding-right:30px">
	
       ${
         totalTributes > 0
           ? `<div class="tribute-grid" style="display: grid; grid-template-columns: repeat(5, auto);grid-auto-rows: min-content;">
    <div><p>TRIBUTO</p></div>
    <div><p>JURISDICCIÓN</p></div>
    <div><p>ALICUOTA</p></div>
    <div><p>BASE IMPONIBLE</p></div>
    <div><p>IMPORTE</p></div>
    ${comprobante.otherTributes
      .map(
        (tribute: any) =>
          `<div><span>${tribute.tribute}</span></div>
          <div><span>${tribute.jurisdiction}</span></div>
          <div><span>${formatNumberAsCurrency(tribute.alicuota)}</span></div>
          <div><span>${formatNumberAsCurrency(
            tribute.base_imponible
          )}</span></div>
          <div><span>${formatNumberAsCurrency(tribute.amount)}</span></div>`
      )
      .join("\n")}

  </div>`
           : "<div style='width: 70px;'></div>"
       }

  <div style="display:flex; flex-direction:column; margin-bottom: 10px; font-weight:400;">
		<p style="font-size:12px; text-align:right; margin-right:0; padding-right:0;">Sub-total: ${formatNumberAsCurrency(
      subtotal ?? 0
    )}</p>
    <p style="font-size:12px; text-align:right;  margin-right:0; padding-right:0; padding-top:5px;">IVA: ${formatNumberAsCurrency(
      iva ?? 0
    )}</p>
		${totalTributes > 0
        ? `<p style="font-size:12px; text-align:right;  margin-right:0; padding-right:0; padding-top:5px;">Otros Tributos: ${formatNumberAsCurrency(
            totalTributes ?? 0
          )}</p>`
        : ""
    }
    ${saldoAfavor && saldoAfavor.total > 0 ?
      `<p style="font-size:12px; text-align:right; margin-right:0; padding-right:0; padding-top:5px;">Pagos a cuenta: ${formatNumberAsCurrency(
        saldoAfavor.total)} </p>`: ""}
    
	</div>
</div>
  
<section style="padding-bottom: 15px; border-bottom: 1.1px solid #D9D9D9 ">
	<div class="resumen-total">
		<div style="font-size:12px;padding-left: 30px; width:350px">
    ${numeroALetras(total ?? 0)}
		</div>
		<div style="color:#6952EB; font-size:16px;font-weight:600; padding-right: 30px; display:flex; flex-direction:row; letter-spacing: 0.05em;">
		  <p style="padding-right:20px;">TOTAL A PAGAR:</p>${formatNumberAsCurrency(
        total ?? 0
      )}
		</div>
	</div>

  ${(comprobante.tipoComprobante.includes("FACTURA") && comprobante.cbu) ? `<div style="font-size:10px; padding-left: 30px; padding-top:10px; width:350px; white-space: nowrap; font-style: italic;">
			Esta factura se debitará en fecha de vencimiento en CBU: ${comprobante.cbu}.
		</div>` : " "}
</section>

       ${getPaymentMethods(comprobante.tipoComprobante)}
  
       <section class="qr-section">
        <div style="display: flex; flex-direction: column; ">
        <div style="display: flex; justify-content: flex-start;" >
          <img
            class="qr"
            src="https://utfs.io/f/f5ff576b-2f11-41b2-8549-39cb4800c7b2-ejsh86.png"
	style="height: 100px; width:100px;"
          />

           <div style="display: flex; flex-direction: column; padding-top:10px; ">
          <img
             style="width:80px; height:20px;"
            src="https://utfs.io/f/8478197f-57ba-4f39-8beb-cdffb1c432cf-m15jgy.png"
            alt="logo-AFIP"
          />

          <p style="color: #3e3e3e; font-style: italic; font-weight: 500; margin-top:4px; margin-bottom: 12px;">Comprobante autorizado</p>
          <p>CAE N° 74172124728083</p>
          <p style="white-space: nowrap">Fecha Vto de CAE: XX/XX/XXXX</p>
        </div>
          </div>
         <div style="">
          <p style="padding-left:7px;">
            Powered by
            <img
              class="bp-logo"
              src="https://utfs.io/f/fa110834-238b-4880-a8c2-eedebe9e6b6e-mnl13r.png"
              alt="logo-Bitcompay"
            />
          </p>
          </div>
          </div>

         ${comprobante?.tipoComprobante.includes("FACTURA") ? (
    `<div class="cae-section" style="text-align: left; ">
        <p>Fecha tope para el pago en redes: XX/XX/XXXX</p>
           <p>Código de pago electrónico PMC: XXXX-XXXXXXXX</p>
          <p>Canales con lectura de código de barras: </p>
          <img
          style="width:340px; height:60px;"
            src="https://utfs.io/f/7ed13ab6-deaa-4257-ad38-7ce19f312f4e-huj7js.png"
            alt="barcode"
          />
        </div>`
  ) : ""}
</div>
      </section>
    </body>
  </html>`;

  return htmlContent;
}

type MedioDePagoDetalles = {
  numeroCheque?: string;
  banco?: string;
  fechaPago?: string;
  fechaEmision?: string;
  bandera?: string;
  tipoTarjeta?: string;
};

const mediosDePagoDetalles: Record<typeof medioDePago[number], MedioDePagoDetalles> = {
  cheque: {
    numeroCheque: '12345678',
    banco: 'Banco Nacional',
    fechaPago: '20/10/2024',
  },
  chequeDiferido: {
    numeroCheque: '87654321',
    banco: 'Banco Provincial',
    fechaEmision: '01/10/2024',
    fechaPago: '25/12/2024',
  },
  tarjeta: {
    bandera: 'Visa',
    tipoTarjeta: 'Crédito',
  },
  canalesDePago: {},
};

const medioDePago = ['cheque', 'chequeDiferido', 'tarjeta', 'canalesDePago'];
function getPaymentMethods(tipoComprobante: string) {
  
  if (tipoComprobante.includes("FACTURA")) {
    return `<section style="padding-left: 30px;  padding-right:30px; padding-top: 15px; padding-bottom: 5px;">
        <h2 style="color: #3E3E3E; font-weight: 500; font-size:16px;">Canales de pago habilitados </h2>
        <div style="display:flex; flex: 1 1 auto; justify-content: space-between; margin-top:20px; margin-bottom:5px; place-items: center;">
          <div class="payment">
            <span>Lectura de código de barras</span>  
          <img
            style="width:30px; height:30px;"
            src="https://utfs.io/f/79d56fb6-2cb7-4760-bbc6-add1a1e434f6-tkdz7.png"
          />
          <img
            style="width:60px; height:40px; z-index: -1;"
            src="https://utfs.io/f/501ea573-2d69-4f4b-9ae3-95531c540d9c-h1yi1.jpg"
          />
          <img
            style="width:65px; height:35px; z-index: 10;"
            src="https://utfs.io/f/e4780803-70ba-4b70-bcf9-f8758eab3a19-b9363v.png"
            alt="Mercadopago"
            />
           </div>
           
          <div class="payment" style="padding-left: 52px; padding-right: 52px;">
            <span>Código de pago electrónico</span>
          <img
            style="width:100px; height:13px;"
            src="https://utfs.io/f/a215f09e-25e8-4eb3-9d1c-6adf1d17baa5-pvvezi.png"
            alt="pagofacil"
          />
         </div>
          <div class="payment" style="align-items: start;">
            <span>Débito automático</span>
            <img
            style="width:40px; height:22px;"
              src="https://utfs.io/f/9383d71a-4feb-47e7-a160-23506688c5b1-j0x0oy.png"
              alt="Visa-debit"
            />
          <img
          style="width:38px; height:12px;z-index: 10;"
            src="https://utfs.io/f/592ca28a-3c10-4b27-a8f3-4f976e83e8ab-r41bgf.png"
            alt="Visa"
            />
          <img
           style="width:28px; height:21px;z-index: 10;"
            src="https://utfs.io/f/23711681-416d-4155-9894-4e6c8584219f-mgfpcc.png"
            alt="Mastercard"
          />
          <img
          style="width:22px; height:28px;"
            src="https://utfs.io/f/919786bf-15c7-41e3-be9a-d537e2bc8c4f-huj7i4.png"
            alt="CBU"
            />
        </div>
         </div>
      </section>`;
  } else if (tipoComprobante.includes("NOTA DE")) {
    return `<div style="height: 80px;"> </div>`; 
  } else {
    return `<div style="height: 80px;"> </div>`;
  }
}

    function renderMediosDePago(medioDePago: keyof typeof mediosDePagoDetalles): string {
      let output = '';
      const detalles = mediosDePagoDetalles[medioDePago];
    
      if (medioDePago === 'cheque' && detalles) {
        output = `
      <section style="padding-left:40px; padding-right:40px; padding-top: 15px; padding-bottom: 5px;">
        <div style="margin-bottom: 8px;">
          <h2 style="color: #3E3E3E; font-weight: bold; font-size:16px; display: inline;">
            Medios de pago:
          </h2>
          <span style="color: #3E3E3E; font-weight: normal; font-size:16px;">
            Cheque
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; color: #3E3E3E; font-size: 16px;">
          <div>
            <span style="font-weight:600; margin-right:10px;">N° de cheque:</span>${detalles.numeroCheque}
          </div>
          <div>
            <span style="font-weight:600; margin-right:10px;">Banco: </span>${detalles.banco}
          </div>
          <div>
            <span style="font-weight:600; margin-right:10px;">Fecha de pago:</span>${detalles.fechaPago}
          </div>
        </div>
      </section>
    `;
  } else if (medioDePago === 'chequeDiferido' && detalles) {
    output = `
      <section style="padding-left:40px; padding-right:40px; padding-top: 15px; padding-bottom: 5px;">
        <div style="margin-bottom: 8px;">
          <h2 style="color: #3E3E3E; font-weight: bold; font-size:16px; display: inline;">
            Medios de pago:
          </h2>
          <span style="color: #3E3E3E; font-weight: normal; font-size:16px;">
            Cheque de pago diferido
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; color: #3E3E3E; font-size: 16px;">
          <div>
            <span style="font-weight:600; margin-right:10px;">N° de cheque:</span>${detalles.numeroCheque}
          </div>
          <div>
            <span style="font-weight:600; margin-right:10px;">Banco:</span>${detalles.banco}
          </div>
          <div>
            <span style="font-weight:600; margin-right:10px;">Fecha de emisión:</span>${detalles.fechaEmision}
          </div>
          <div>
            <span style="font-weight:600; margin-right:10px;">Fecha de pago:</span>${detalles.fechaPago}
          </div>
        </div>
      </section>
    `;
  } else if (medioDePago === 'tarjeta' && detalles) {
    output = `
      <section style="padding-left:40px; padding-right:40px; padding-top: 15px; padding-bottom: 5px;">
        <div style="margin-bottom: 8px;">
          <h2 style="color: #3E3E3E; font-weight: bold; font-size:16px; display: inline;">
            Medios de pago:
          </h2>
          <span style="color: #3E3E3E; font-weight: normal; font-size:16px;">
            Tarjeta
          </span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; color: #3E3E3E; font-size: 16px;">
          <div>
            <span style="font-weight:600; margin-right:10px;">Bandera:</span>${detalles.bandera}
          </div>
          <div>
            <span style="font-weight:600; margin-right:10px;">Tipo de tarjeta:</span>${detalles.tipoTarjeta}
          </div>
        </div>
      </section>
    `;
  }
  const medioDePagoSeleccionado = 'cheque';
const paymentDetailsSection = renderMediosDePago(medioDePagoSeleccionado as keyof typeof mediosDePagoDetalles);
console.log(paymentDetailsSection);

  return output;
}

export async function ingresarAfip() {
  //CUIT QUE QUEREMOS QUE COBRE
  const taxId = 23439214619;

  //USUARIO PARA ENTRAR A AFIP
  const _username = "23439214619";

  //CONTRASEÑA PARA ENTRAR A AFIPs
  const _password = "";

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
  // const serSer = await afip.CreateWSAuth(_username, _password, alias, wsid);
  // console.log(serSer);
  // const salesPoints = await afip.ElectronicBilling.getSalesPoints();
  // console.log(salesPoints);
  // const serSer = await afip.CreateWSAuth(username, password, alias, wsid);

  return afip;
}

function numeroALetras(numero: number | undefined): string {
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
    "ciento",
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
    "veintiuno",
    "veintidos",
    "veintitres",
    "veinticuatro",
    "veinticinco",
    "veintiseis",
    "veintisiete",
    "veintiocho",
    "veintinueve",
  ];


  const capitalizarPrimeraLetra = (texto: string): string => {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  };

  const obtenerDecimales = (numero: number | undefined): string | null => {
    if (!numero) return null;
    let numeroStr = numero.toString();
    let partes = numeroStr.split(".");
    if (partes.length === 2) {
      let decimales = partes[1]!.substring(0, 2);
      return decimales.padEnd(2, "0");
    }
    return null;
  };

  const convertirParteEntera = (numero: number): string => {
    if (numero === 0) return "cero";
    if (numero < 10) return unidades[numero]!;
    if (numero >= 11 && numero < 20) return especiales[numero - 11]!;
    if (numero >= 21 && numero < 30) return especiales[numero - 12]!;
    if (numero < 100) {
      return (
        decenas[Math.floor(numero / 10)] +
        (numero % 10 !== 0 ? " y " + unidades[numero % 10] : "")
      );
    }
    if (numero < 1000) {
      let centena = Math.floor(numero / 100);
      let resto = numero % 100;
      if (resto === 0 && centena === 1) return "cien";
      return (
        centenas[centena] +
        (resto !== 0 ? " " + convertirParteEntera(resto) : "")
      );
    }
    if (numero < 1000000) {
      let miles = Math.floor(numero / 1000);
      let resto = numero % 1000;
      if (miles === 1) {
        return "mil" + (resto !== 0 ? " " + convertirParteEntera(resto) : "");
      }
      return (
        convertirParteEntera(miles) +
        " mil" +
        (resto !== 0 ? " " + convertirParteEntera(resto) : "")
      );
    }
    if (numero < 100000000) {
      let millones = Math.floor(numero / 1000000);
      let resto = numero % 1000000;
      if (millones === 1) {
        return (
          "un millón" + (resto !== 0 ? " " + convertirParteEntera(resto) : "")
        );
      }
      return (
        convertirParteEntera(millones) +
        " millones" +
        (resto !== 0 ? " " + convertirParteEntera(resto) : "")
      );
    }
    return "Número fuera de rango";
  };

  if (numero) {
    let parteEntera = Math.floor(numero);
    let parteDecimal = obtenerDecimales(numero);

    let resultadoParteEntera = convertirParteEntera(parteEntera);

    return (
      capitalizarPrimeraLetra(resultadoParteEntera) + `${parteDecimal ? `con ${parteDecimal}/100`:""}`
    );
  }

  return "";
}

export const valueToNameComprobanteMap: Record<string, string> = {
  "0": "Recibo",
  "1": "Factura",
  "3": "Nota de crédito",
  "6": "Factura",
  "8": "Nota de crédito",
};
export const comprobanteDictionary: { [key: string]: number } = {
  "FACTURA A": 1,
  "FACTURA B": 6,
  "FACTURA C": 11,
  "FACTURA M": 51,
  "NOTA DE DEBITO A": 2,
  "NOTA DE DEBITO B": 7,
  "NOTA DE DEBITO C": 12,
  "NOTA DE DEBITO M": 52,
  "NOTA DE CREDITO A": 3,
  "NOTA DE CREDITO B": 8,
  "NOTA DE CREDITO C": 13,
  "NOTA DE CREDITO M": 53,
  "": 0,
};

export const fcAnc: { [key: string]: string } = {
  "FACTURA A": "NOTA DE CREDITO A",
  "FACTURA B": "NOTA DE CREDITO B",
  "FACTURA C": "NOTA DE CREDITO C",
  "FACTURA M": "NOTA DE CREDITO M",
  "FACTURA E": "NOTA DE CREDITO E",
  "NOTA DE CREDITO A": "FACTURA A",
  "NOTA DE CREDITO B": "FACTURA B",
  "NOTA DE CREDITO C": "FACTURA C",
  "NOTA DE CREDITO M": "FACTURA M",
  "NOTA DE CREDITO E": "FACTURA E",
};

export const reverseComprobanteDictionary: { [key: number]: string } = {
  1: "FACTURA A",
  6: "FACTURA B",
  11: "FACTURA C",
  51: "FACTURA M",
  2: "NOTA DE DEBITO A",
  7: "NOTA DE DEBITO B",
  12: "NOTA DE DEBITO C",
  52: "NOTA DE DEBITO M",
  3: "NOTA DE CREDITO A",
  8: "NOTA DE CREDITO B",
  13: "NOTA DE CREDITO C",
  53: "NOTA DE CREDITO M",
  0: "RECIBO",
};

export const reversedIvaDictionary: { [key: string]: number } = {
  "0": 3,
  "10.5": 4,
  "21": 5,
  "27": 6,
  "5": 8,
  "2.5": 9,
  "": 0,
};

export const ivaDictionary: { [key: number]: string } = {
  3: "0",
  4: "10.5",
  5: "21",
  6: "27",
  8: "5",
  9: "2.5",
  0: "",
};

export const idDictionary: { [key: string]: number } = {
  CUIT: 80,
  CUIL: 86,
  DNI: 96,
  "Consumidor Final": 99,
};
export const reversedIdDictionary: { [key: number]: string } = {
  80: "CUIT",
  86: "CUIL",
  96: "DNI",
  99: "Consumidor Final",
};

export function getDifferentialAmount(grupo: any, fechaPreliq: Date) {
  let importe = 0;
  grupo.integrants?.forEach((integrant: any) => {
    if (integrant.birth_date == null) return 0;
    const age = calcularEdad(integrant.birth_date);

    let precioIntegrante = grupo.plan?.pricesPerCondition
      ?.sort(
        (a: any, b: any) => b.validy_date.getTime() - a.validy_date.getTime()
      )
      .find(
        (x: any) =>
          integrant.relationship &&
          x.condition == integrant.relationship &&
          x.validy_date.getTime() <= fechaPreliq.getTime()
      )?.amount;

    if (precioIntegrante === undefined) {
      precioIntegrante =
        grupo.plan?.pricesPerCondition?.find(
          (x: any) => (x.from_age ?? 1000) <= age && (x.to_age ?? 0) >= age
        )?.amount ?? 0;
    }
    integrant?.differentialsValues.forEach((differential: any) => {
      const differentialIntegrante =
        differential.amount * (precioIntegrante ?? 0);
      importe += differentialIntegrante;
    });
  });
  return importe;
}

export function getGroupContribution(grupo: any) {
  let importe = 0;
  grupo.integrants?.forEach((integrant: any) => {
    if (integrant?.contribution?.amount) {
      const contributionIntegrante = integrant?.contribution?.amount ?? 0;
      importe += contributionIntegrante;
    }
  });
  return importe;
}

export const reverseConceptDictionary: { [key: number]: string } = {
  1: "Productos",
  2: "Servicios",
  3: "Productos y Servicios",
  0: "",
};

export function visualizationSwitcher(
  visualization: boolean,
  editFormComponent: React.ReactNode,
  viewFormComponent: React.ReactNode
) {
  return visualization ? viewFormComponent : editFormComponent;
}

export function Capitalize(value: string) {
  const firstChar = value.charAt(0).toUpperCase();
  const rest = value.slice(1).toLowerCase();

  return firstChar + rest;
}