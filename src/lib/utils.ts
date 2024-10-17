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

function formatNumberAsCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  }).format(amount);
}

let comprobanteCortado = "ss";

function getTagForTipoComprobante(tipoComprobante: string):string{
  comprobanteCortado = tipoComprobante;
  if (tipoComprobante.includes(" A")) {
    comprobanteCortado = comprobanteCortado.replace(" A", "");
    return "A";
  }
  else if (tipoComprobante.includes(" B")) {
    comprobanteCortado = comprobanteCortado.replace(" B", "")
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
  items: Array<{ concept: string | null; total: number | null }>
): string {
  return items.map((item) => `<p>${item.concept}</p>`).join("");
}

function generateAmounts(
  items: Array<{ concept: string | null; total: number | null }>
): string {
  return items.map((item) => `<p>${item.total}</p>`).join("");
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

export function htmlBill(
  comprobante: any,
  company: any,
  producto: any,
  voucher: number,
  brand: /* outerOutputs["brands"]["list"][number] */
  InferSelectModel<typeof schema.brands> | undefined,
  name: string,
  domicilio: string,
  localidad: string,
  provincia: string,
  sellCondition: string | undefined,
  id_type: string,
  id_number: string,
  afip_status: string
) {
  let subtotal = 0;
  let iva = 0;
  if(comprobante.items.length > 0){
    subtotal = comprobante.items.reduce(
      (acc: number, item: { total: number }) => acc + (item?.total ?? 0),
      0
    )
    const iva = comprobante?.items.reduce(
      (acc: number, item: { iva: number }) => acc + (item?.iva ?? 0),
      0
    )
  }

  let totalTributes = 0;

  if(comprobante.otherTributes.length > 0){
    totalTributes = comprobante.otherTributes.reduce(
      (acc: number, tribute: { amount: number }) => acc + (tribute?.amount ?? 0),
      0
    )
  }


 const total = subtotal + iva + totalTributes
  
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
        font-family: "Roboto", sans-serif;
      }

      body {
        padding: 1 rem;
        -webkit-print-color-adjust: exact; 
		print-color-adjust: exact;
    font-family: "Open Sans", sans-serif;
    color: #3e3e3e
      }
      header {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        border-bottom: 1px solid #ccc;
        width: 100%;
      }
        
        .tribute-grid div {
padding-bottom:3px
}

        .items-1 {
        margin-left:40px;
        padding-bottom: 0;
      }

      .items-1 p {
        font-size: 12px;
        font-weight: 400;
        color: #3E3E3E;
margin-bottom:1px;
      }

      .logo {
        width: 25vw;
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
        padding-bottom: 0rem;
        margin-right:40px;
        display: flex;
        flex-direction: column;
      }

      .items-3 h2 {
        font-size: 1.7rem;
        font-weight: 500;
        line-height: 25px;
      }

      .items-3 p {
        display: flex;
        font-size: 12px;
        color: #3E3E3E;
margin-bottom:1px;
      }

      .parte-2 {
         display: flex;
        justify-content: space-between;
         margin-bottom: 1rem; 
 	font-size: 12px;
        flex-direction: column;
	padding-bottom: 3px; 
        color: #3E3E3E;
      }

      .datos-1 {
        font-size: 16px;
        margin: 10px 10px 10px 0;
        list-style-type: none;
        line-height: 30px;
        color: #303030;
      }
      .datos-1 li p span {
        font-weight: 600;
        opacity: 70;
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
        opacity: 70;
      }

      .parte-3 {
        display: flex;
        justify-content: end;
        align: right;
        margin-bottom: 1rem; 
        border-top: none;
        border-bottom: 1.6px solid #8fefdc;
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
        border-bottom: 1.6px solid #8fefdc;
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
        border-bottom: 1.6px solid #8fefdc;
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
        margin-top: 20px;
        margin-left: 40px;
    margin-right:40px;
      }

.qr-section p{
font-size: 10px;
margin-bottom: 1px;
}
      .qr {
        width: 150px;
      }

      .cae-section {
        flex-direction: column;
      }
      .cae-section p {
        font-size: 12px;
	height:15px;
        font-weight: 400;
        color: #333;
        margin-bottom:0;
        padding-bottom: 0;
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

p {
    font-size: 14px;
    color: #666;
    margin-bottom: 5px;
}

.line {
    width: 1px;
    height: 60px;
    background-color: #ccc;
    margin: 0 auto 0;
}

.grid {
	font-size: 15px;
	padding-right: 40px;
	padding-left: 40px
}

.grid div {
padding-bottom: 10px;
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
    color: #3E3E3E;
	background-color: #f1f1f1;
	border-style : hidden;
}

.conceptotables-cell {
    padding-top: 10px;
	padding-bottom: 10px;
    border-top: 1px solid #ddd;
    color: #666;
	border-style : hidden;
}

.tributos p {
font-size:10px
}
.tributos {
padding-top: 15px;
border-top: 1px solid #ccc
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
        <div class="icon">
				<span>${getTagForTipoComprobante(comprobante?.tipoComprobante ?? "")}</span>
			  </div>
			<div class="line"></div>
        </div>
  
        <div class="items-3" style="padding-bottom: 5px;">
          <div>
           <h3 style=" font-size: 16px; font-weight:500; padding-bottom:3px;">
            ${comprobanteCortado ?? ""} </h3>
           <h3 style=" font-size: 14px; font-weight:400; padding-bottom:3px;">
            N° ${comprobante?.ptoVenta.toString().padStart(4, "0")}-${voucher
    .toString()
    .padStart(8, "0")}
          </h3>

          <p> Fecha de Emisión: ${dateNormalFormat(new Date())}</p>
          	<p> C.U.I.T:${company.cuit}</p>
            <p> Ingresos Brutos: 0</p>
          <p> Fecha de Inicio de Actividad: ${dateNormalFormat(
            company.activity_start_date
          )}</p>
        </div>
      </header>
  
    <div class="parte-2">	
		<div class="grid" style="display:flex; flex-direction:row; justify-content:space-between">
          <div>
				<span><span style="font-weight:600; opacity:70;margin-right:4px;">Nombre/Razón Social:</span>${name}</span>
          </div>
          <div>
				<span><span style="font-weight:600; opacity:70;margin-right:4px;">${id_type}</span>${id_number}</span>
			</div>
      </div>
		<div class="grid">
		<div>
          <span><span style="font-weight:600; opacity:70;margin-right:4px;">Domicilio:</span>${domicilio} ${localidad} ${provincia}</span>
			</div>
      	</div>

        <div class="grid" style="display:flex; flex-direction:row; justify-content:space-between">
		<div style="display:flex; flex-direction:column; justify-content:start">
			<div>
				<span><span style="font-weight:600; opacity:70;margin-right:4px;">Condición AFIP:</span>${afip_status}</span>
     	</div>
      	<div>
				<span><span style="font-weight:600; opacity:70;margin-right:4px;">Período:</span>${dateNormalFormat(
          comprobante?.fromPeriod
        )}</span>
			</div>	
      	</div>
		<div style="display:flex; flex-direction:column; justify-content:start">
			<div>
				<span><span style="font-weight:600; opacity:70;margin-right:4px;">Condición de venta:</span>${sellCondition}</span>
			</div>	
			<div>
				<span><span style="font-weight:600; opacity:70;margin-right:4px;">Fecha de vencimiento:</span>${dateNormalFormat(
          comprobante?.due_date
        )}</span>
			</div>
		</div>
	  </div>
  
    <div class="conceptotables-container" style="height: 280px;">
        <table class="conceptotables">
            <thead>
                <tr>
                    <th class="conceptotables-header" style="text-align:left;padding-left:40px;background-color: #f0f0f0;border-top-left-radius:5px;border-bottom-left-radius:5px" >Conceptos</th>
                    <th class="conceptotables-header" style="text-align:right;padding-right:40px;border-top-right-radius:5px;border-bottom-right-radius:5px">Importe</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="conceptotables-cell" style="text-align:left;padding-left:40px;"> ${conceptosList}</td>
                    <td class="conceptotables-cell" style="text-align:right;padding-right:40px;">${amountsList}</td>
                </tr>
            </tbody>
        </table>
    </div>


       <div class="tributos" style="display:flex; flex-direction: row;justify-content:space-between; padding-left:40px; padding-right:40px">
	
       ${totalTributes > 0 ? (`<div class="tribute-grid" style="display: grid; grid-template-columns: repeat(5, 1fr);grid-auto-rows: min-content;">
    <!-- Use div or span instead of p for inline layout if needed -->
    <div><p style="font-weight: 600; margin: 0;">TRIBUTO</p></div>
    <div><p style="font-weight: 600; margin: 0;">JURISDICCIÓN</p></div>
    <div><p style="font-weight: 600; margin: 0;">ALICUOTA</p></div>
    <div><p style="font-weight: 600; margin: 0;">BASE IMPONIBLE</p></div>
    <div><p style="font-weight: 600; margin: 0;">IMPORTE</p></div>
    <!-- Example content -->
    ${comprobante.otherTributes
      .map(
        (tribute: any) =>
          `<div><span>${tribute.tribute}</span></div>
          <div><span>${tribute.jurisdiction}</span></div>
          <div><span>${formatNumberAsCurrency(tribute.alicuota)}</span></div>
          <div><span>${formatNumberAsCurrency(tribute.base)}</span></div>
          <div><span>${formatNumberAsCurrency(tribute.amount)}</span></div>`
      )
      .join("\n")}

  </div>`) : ("<div style='width: 70px;'></div>")}

  <div style="display:flex; flex-direction:column; margin-bottom: 10px; font-weight:500;">
		<p style="font-size:12px; text-align:right; ">Sub-total: ${formatNumberAsCurrency(subtotal ?? 0)}</p>
    <p style="font-size:12px; text-align:right">IVA: ${formatNumberAsCurrency(iva ?? 0)}</p>
		${totalTributes > 0 ? (`<p style="font-size:12px; text-align:right">Otros Tributos: ${formatNumberAsCurrency(totalTributes ?? 0)}</p>`) : ("")}
    
    <p style="font-size:12px; text-align:right">Pagos a cuenta: $XX.XXX,XX</p>
	</div>
</div>
  
<section style="padding-bottom: 15px; border-bottom:1px solid #ccc ">
	<div class="resumen-total">
		<div style="font-size:12px;padding-left:40px; width:350px">
    ${numeroALetras(Math.floor(total ?? 0))}
		</div>
		<div style="color:#6952EB; font-size:16px;font-weight:600; padding-right: 40px; display:flex; flex-direction:row">
		<div style="padding-right:15px">TOTAL A PAGAR:</div>${formatNumberAsCurrency(
      total ?? 0
    )}
		</div>
	</div>

  <div style="font-size:12px;padding-left:40px; padding-top:10px; width:350px; white-space: nowrap; font-style: italic;">
			Esta factura se debitará en fecha de vencimiento en CBU: XXXXXXXXXXXXXXXXXXXXXXXXX.
		</div>
</section>

     
       <section style="padding-left:40px; padding-right:40px; padding-top: 15px; padding-bottom: 5px;">
        <h2 style="color: #3E3E3E; font-weight: 500; font-size:16px;">Canales de pago habilitados </h2>
        <div style="display:flex; flex: 1 1 auto; justify-content: space-between; margin-top:20px; margin-bottom:5px; place-items: center;">
          <div class="payment">
            <span>Lectura de código de barras</span>  
          <img
            style="width:30px; height:32px;"
            src="https://utfs.io/f/79d56fb6-2cb7-4760-bbc6-add1a1e434f6-tkdz7.png"
          />
          <img
             style="width:60px; height:40px;"
            src="https://utfs.io/f/501ea573-2d69-4f4b-9ae3-95531c540d9c-h1yi1.jpg"
          />
          <img
            style="width:55px; height:35px;"
            src="https://getlogovector.com/wp-content/uploads/2023/12/mercado-pago-logo-vector-2023.png"
            />
           </div>
           
          <div class="payment" style="height: 40px; padding-left: 35px; padding-right: 35px;">
            <span>Código de pago electrónico</span>
          <img
            style="width:100px; height:15px;"
            src="https://utfs.io/f/a215f09e-25e8-4eb3-9d1c-6adf1d17baa5-pvvezi.png"
          />
         </div>
          <div class="payment">
            <span>Débito automático</span>
            <img
              src="/comprobantes/visa-deb.svg"
            />
          <img
            src="/comprobantes/visa.svg"
            />
          <img
           style="width:40px; height:30px;"
            src="https://utfs.io/f/23711681-416d-4155-9894-4e6c8584219f-mgfpcc.png"
          />
        </div>
         </div>
      </section>
  
       <section class="qr-section">
        <div style="display: flex; flex-direction: column; ">
        <div style="display: flex; justify-content: flex-start;" >
          <img
            class="qr"
            src="https://utfs.io/f/2dd25618-943b-41f4-8c0e-363fc8ba3228-n3iun9.png"
	style="height: 100px; width:100px;"
          />

           <div style="display: flex; flex-direction: column; padding-left:10px; ">
          <img
             style="width:100px; height:40px;"
            src="/comprobantes/logo-afip.png"
          />

          <p style="color: #333; font-style: italic; font-weight: 500; margin-bottom: 10px;">Comprobante autorizado</p>
          <p>CAE N° XXXXXXXXX</p>
          <p style="white-space: nowrap">Fecha Vto de CAE: XX/XX/XXXX</p>
        </div>
          </div>
         <div style="padding-top:5px;">
          <p>
            Powered by
            <img
              class="bp-logo"
              src="https://utfs.io/f/fa110834-238b-4880-a8c2-eedebe9e6b6e-mnl13r.png"
            />
          </p>
          </div>
          </div>

        <div class="cae-section" style="text-align: left;">
           <p>CÓDIGO DE PAGO ELECTRÓNICO: XXXX-XXXXXXXX</p>
          <p>FECHA TOPE PARA EL PAGO EN REDES: XX/XX/XXXX</p>
          <p>CANALES CON LECTURA DE CÓDIGO DE BARRAS: </p>
          <img
            src="/comprobantes/codigo-barra.svg"
          />
        </div>
      </section>
    </body>
  </html>`;

  return htmlContent;
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
  if (numero) {
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
      return (
        centenas[centena] + (resto !== 0 ? " " + numeroALetras(resto) : "")
      );
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
  return "";
}

function obtenerDecimales(numero: number | undefined) {
  if (!numero) return "00";
  console.log("numeroStr");
  console.log(numero);
  let numeroStr = numero.toString();
  let partes = numeroStr.split(".");
  if (partes.length === 2) {
    let decimales = partes[1]!.substring(0, 2); // Obtiene los dos primeros decimales
    return decimales.padEnd(2, "0"); // Asegura que siempre haya dos dígitos
  }
  return "00"; // Retorna "00" si no hay parte decimal
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
