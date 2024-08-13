import utc from "dayjs/plugin/utc";
import dayOfYear from "dayjs/plugin/dayOfYear";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
import { useBarcode } from "next-barcode";
import { useRef, useState } from "react";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(dayOfYear);
dayjs.locale("es");

function formatString(
  char: string,
  string: string,
  limit: number,
  final: boolean
) {
  if (string.length > limit) {
    string = string.substring(0, limit);
  }
  if (string.length === limit) {
    return string;
  }
  if (final) {
    return string.concat(char.repeat(limit - string.length));
  }
  return char.repeat(limit - string.length).concat(string);
}

function formatAmount(number: number, limit: number) {
  let numString = number.toString();

  if (numString.includes(".")) {
    let punto = numString.indexOf(".");
    numString = numString.slice(0, punto + 2);

    numString = numString.replace(".", "");
    numString = numString + "0";

    while (numString.length < limit + 2) {
      numString = "0" + numString;
    }

    return numString;
  } else {
    while (numString.length < limit) {
      numString = "0" + numString;
    }

    return numString + "00";
  }
}

// Función para calcular el dígito verificador con módulo 11
function modulo11Verifier(code: string) {
  let sum = 0;
  let weight = 2;

  for (let i = code.length - 1; i >= 0; i--) {
    sum += parseInt(code[i]!) * weight;
    weight = weight === 7 ? 2 : weight + 1;
  }

  const remainder = sum % 11;
  let verifierDigit = 11 - remainder;

  // Asegúrate de que el dígito verificador sea de dos dígitos
  if (verifierDigit >= 10) {
    return verifierDigit.toString().padStart(2, "0");
  } else {
    return "0" + verifierDigit;
  }
}

interface BarcodeProps {
  dateVto: Date | undefined;
  amountVto: number;
  client: number | null;
  isPagoFacil: boolean;
  invoiceNumber: number;
}

export default function BarcodeProcedure({
  amountVto,
  dateVto,
  client,
  invoiceNumber,
  isPagoFacil,
}: BarcodeProps) {
  if (isPagoFacil) {
    const first_date_YY = dayjs(dateVto).format("YY");
    const first_date_DDD = dayjs(dateVto)
      .dayOfYear()
      .toString()
      .padStart(3, "0");

    const amount = formatAmount(amountVto, 6);
    const client_id = formatString("0", client!.toString(), 14, false);

    // Genera el texto base del código de barras (sin el dígito verificador)
    const baseCode = `3509${amount}${first_date_YY}${first_date_DDD}${client_id}0${"0".repeat(
      8
    )}`;

    // Calcula el dígito verificador usando el código base
    const verifierDigit = modulo11Verifier(baseCode);

    // Concatenar el código base con el dígito verificador
    const finalCode = `${baseCode}${verifierDigit}\r\n`;

    const { inputRef } = useBarcode({
      value: finalCode,
      options: {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: true,
      },
    });

    return `<svg ref={${inputRef}}/>`;
  } else {
    const first_date_YY = dayjs(dateVto).format("YY");
    const first_date_DDD = dayjs(dateVto)
      .dayOfYear()
      .toString()
      .padStart(3, "0");

    const invoice_number = formatString(
      "0",
      invoiceNumber.toString(),
      10,
      false
    );

    const amount = formatAmount(amountVto, 8);

    // Genera el texto base del código de barras (sin el dígito verificador)
    const baseCode = `3509${invoice_number}${amount}${first_date_YY}${first_date_DDD}`;

    // Calcula el dígito verificador usando el código base
    const verifierDigit = modulo11Verifier(baseCode);

    // Concatenar el código base con el dígito verificador
    const finalCode = `${baseCode}${verifierDigit}\r\n`;

    const { inputRef } = useBarcode({
      value: finalCode,
      options: {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: true,
      },
    });
    // const [barcodeBase64, setBarcodeBase64] = useState<string | null>(null);

    let barcodeBase64 = "";
    const convertSVGToBase64 = (svg: string) => {
      const svg64 = window.btoa(unescape(encodeURIComponent(svg)));
      return `data:image/svg+xml;base64,${svg64}`;
    };

    // Convert SVG to Base64 after barcode is generated
    if (inputRef.current) {
      const svg = inputRef.current.outerHTML;
      barcodeBase64 = convertSVGToBase64(svg);
    }

    return `<div>
        {${barcodeBase64} ? (
          <img src={${barcodeBase64}} alt="Código de barras" />
        ) : (
          <div ref={${inputRef}} />
        )}
      </div>`;
  }
}
