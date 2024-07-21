import utc from "dayjs/plugin/utc";
import dayOfYear from "dayjs/plugin/dayOfYear";
import timezone from "dayjs/plugin/timezone";
import dayjs from "dayjs";
import { useBarcode } from "next-barcode";
import { Comprobantes } from "~/server/db/schema";

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

interface barcodeProps {
  dateVto: Date | undefined;
  amountVto: number;
  client: number | null;
  peso: number | null;
  amount2vto: number;
  date2vto: number;
  Digit: number;
}
export default function BarcodeProcedure({
  amountVto,
  dateVto,
  client,
  peso,
  amount2vto,
  date2vto,
  Digit,
}: barcodeProps) {
  const date = dayjs(dateVto);
  const year = date.year();
  const monthName = date.format("MMMM").toUpperCase();
  const period = formatString(" ", `${monthName} ${year}`, 22, true);
  const dateYYYYMMDD = date.format("YYYYMMDD");

  const first_due_amount_bar_code = formatString(
    "0",
    dateVto!.toString(),
    8,
    false
  );

  let collected_amount;
  collected_amount = amountVto ?? amountVto;
  let text = `3509${amountVto}${dateVto}${client}0${amount2vto}${amount2vto}${date2vto}${Digit}${" ".repeat(
    26
  )}20${" ".repeat(42)}\r\n`;

  // const { inputRef } = useBarcode({
  //   value: "text",
  // });

  return text;
}

//   console.log(
//     "1: ",
//     entityService,
//     "2: ",
//     amountVto,
//     "3: ",
//     dateVto,
//     "4: ",
//     client,
//     "5: ",
//     peso,
//     "6: ",
//     amount2vto,
//     "7: ",
//     date2vto,
//     "8: ",
//     Digit
//   );
// const bar_code = `${service_company}${first_due_amount_bar_code}${first_due_date_bar_code}${fiscal_id_number_bar_code}0${second_due_amount_charge}${first_due_date.slice(`;
