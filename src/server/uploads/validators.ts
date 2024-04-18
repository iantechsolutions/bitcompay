import dayjs from "dayjs";
import { z } from "zod";
import type { TableHeaders } from "~/components/table";

export type DOCRowsValidatorAndTransformer = (
  rows: Record<string, unknown>[],
) => Record<string, unknown>[];

const stringToValidIntegerZodTransformer = z
  .string()
  .or(z.number())
  .transform((v) => parseInt(v.toString()))
  .refine(Number.isInteger);

const nullableStringToValidIntegerZodTransformer = z
  .string()
  .or(z.number())
  .nullable()
  .optional()
  .transform((v) => {
    if (!v || v?.toString().trim() === "") return null;
    return parseInt(v.toString());
  })
  .refine((v) => (v == null ? true : Number.isInteger(v)));

const stringAsDate = z
  .string()
  .or(z.number())
  .transform((value) => {
    if (typeof value === "number") {
      value = value.toString().padStart(8, "0");
    }

    const last4 = parseInt(value.substring(4, 8));

    let day = value.substring(6, 8);
    let month = value.substring(4, 6);
    let year = value.substring(0, 4);

    if (last4 > 2000) {
      day = value.substring(0, 2);
      month = value.substring(2, 4);
      year = value.substring(4, 8);
    }

    return dayjs(`${year}-${month}-${day}`).toDate();
  })
  .refine((value) => {
    if (value.getFullYear() < 2000) return false;
    if (value.getFullYear() > 3000) return false;
    return true;
  });

const stringAsPeriod = z
  .string()
  .transform((value) => {
    return dayjs(value, "MMYYYY").toDate();
  })
  .refine((value) => {
    if (value.getFullYear() < 2000) return false;
    if (value.getFullYear() > 3000) return false;
    return true;
  });

const cbuSchema = z
  .string()
  .or(z.number())
  .transform((value) => {
    return value.toString().replaceAll("/", "").padStart(22, "0");
  })
  .refine((value) => value.length === 22);

export const recDocumentValidator = z
  .object({
    "G.C.": z.number().int().min(0).max(14000).nullable().optional(),
    "Apellido y Nombre": z.string().min(1).max(140).nullable().optional(),
    "Tipo ID Fiscal": z
      .literal("CUIT")
      .or(z.literal("CUIL"))
      .nullable()
      .optional(),
    "Nro ID Fiscal": stringToValidIntegerZodTransformer.nullable().optional(),
    "Tipo DU": z
      .literal("DNI")
      .or(z.literal("LC"))
      .or(z.literal("LE"))
      .nullable()
      .optional(),
    "Nro DU": stringToValidIntegerZodTransformer.nullable().optional(),
    Producto: z
      .string({
        invalid_type_error: "El Producto no es válido",
        required_error: 'Falta columna "Producto"',
      })
      .min(1)
      .max(140)
      .optional(),
    "Nro CBU": cbuSchema.nullable().optional(),
    "TC Marca": z.string().min(1).max(140).nullable().optional(),
    "Alta Nueva": z
      .string()
      .transform((value) => value.toLowerCase() === "SI")
      .nullable()
      .optional(),
    "Nro. Tarjeta": z.string().length(16).nullable().optional(),
    // NOT OPTIONAL!!!
    "Nro Factura": stringToValidIntegerZodTransformer.optional(),
    //
    Período: stringAsPeriod.nullable().optional(),
    "Importe 1er Vto.": stringToValidIntegerZodTransformer
      .nullable()
      .optional(),
    "Fecha 1er Vto.": stringAsDate.nullable().optional(),
    "Importe 2do Vto.": stringToValidIntegerZodTransformer
      .nullable()
      .optional(),
    "Fecha 2do. Vto.": stringAsDate.nullable().optional(),
    "Info. Adicional": z
      .string()
      .min(1)
      .max(140)
      .catch("")
      .nullable()
      .optional(),
    "Canal de Cobro": z
      .string()
      .min(0)
      .max(140)
      .catch("")
      .nullable()
      .optional(),
    "Fecha de Pago/Débito": stringAsDate.nullable().optional(),
    "Importe Cobrado": nullableStringToValidIntegerZodTransformer
      .nullable()
      .optional(),
    "Obs.": z.string().min(0).max(1023).catch("").nullable().optional(),
    "Estado de Pago": z.string().nullable().optional(),
  })
  .transform((value) => {
    // Translated to english
    return {
      g_c: value["G.C."] ?? null,
      name: value["Apellido y Nombre"] ?? null,
      fiscal_id_type: value["Tipo ID Fiscal"] ?? null,
      fiscal_id_number: value["Nro ID Fiscal"] ?? null,
      du_type: value["Tipo DU"] ?? null,
      du_number: value["Nro DU"] ?? null,
      product_number: parseInt(value.Producto ?? "") ?? null,
      cbu: value["Nro CBU"] ?? null,
      card_brand: value["TC Marca"] ?? null,
      is_new: value["Alta Nueva"] ?? null,
      card_number: value["Nro. Tarjeta"] ?? null,
      invoice_number: value["Nro Factura"] ?? null,
      period: value["Período"] ?? null,
      first_due_amount: value["Importe 1er Vto."] ?? null,
      first_due_date: value["Fecha 1er Vto."] ?? null,
      second_due_amount: value["Importe 2do Vto."] ?? null,
      second_due_date: value["Fecha 2do. Vto."] ?? null,
      additional_info: value["Info. Adicional"] ?? null,
      payment_channel: value["Canal de Cobro"] ?? null,
      payment_date: value["Fecha de Pago/Débito"] ?? null,
      collected_amount: value["Importe Cobrado"] ?? null,
      comment: value["Obs."] ?? null,
      payment_status: value["Estado de Pago"] ?? null,
    };
  });

// export const recRowsTransformer = (rows: Record<string, unknown>[]) => {
//   return z.array(recDocumentValidator).parse(rows);
// };


export const recRowsTransformer = (rows: Record<string, unknown>[]) => {
  const cellsToEdit: { row: { g_c: number | null; name: string | null; fiscal_id_type: "CUIT" | "CUIL" | null; fiscal_id_number: number | null; du_type: "DNI" | "LC" | "LE" | null; du_number: number | null; product_number: number | null; cbu: string | null; card_brand: string | null; is_new: boolean | null; card_number: string | null; invoice_number: number | null; period: Date | null; first_due_amount: number | null; first_due_date: Date | null; second_due_amount: number | null; second_due_date: Date | null; additional_info: string | null; payment_channel: string | null; payment_date: Date | null; collected_amount: number | null; comment: string | null; payment_status: string | null; }; column: string | number | undefined; reason: string }[] = [];
  const transformedRows: ({ g_c: number | null; name: string | null; fiscal_id_type: "CUIT" | "CUIL" | null; fiscal_id_number: number | null; du_type: "DNI" | "LC" | "LE" | null; du_number: number | null; product_number: number; cbu: string | null; card_brand: string | null; is_new: boolean | null; card_number: string | null; invoice_number: number | null; period: Date | null; first_due_amount: number | null; first_due_date: Date | null; second_due_amount: number | null; second_due_date: Date | null; additional_info: string | null; payment_channel: string | null; payment_date: Date | null; collected_amount: number | null; comment: string | null; payment_status: string | null; })[] = [];
  const defaultRow = {g_c: null,name: null,fiscal_id_type: null,fiscal_id_number: null,du_type: null,du_number: null,product_number: 0,cbu: null,card_brand: null,is_new: null,card_number: null,invoice_number: null,period: null,first_due_amount: null,first_due_date: null,second_due_amount: null,second_due_date: null,additional_info: null,payment_channel: null,payment_date: null,collected_amount: null,comment: null,payment_status: null,  };
  rows.forEach((row, rowIndex) => {
    try {
      const parsedRow = z.array(recDocumentValidator).parse([row]);
      console.log("aca");
      console.log(parsedRow);
      transformedRows.push(parsedRow.at(0) ?? defaultRow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((zodError) => {
          const column = zodError.path[zodError.path.length - 1];
          cellsToEdit.push({
            row: {
              g_c:row.g_c as number | null,
              name: row.name as string | null,
              fiscal_id_type: row.fiscal_id_type as "CUIT" | "CUIL" | null,
              fiscal_id_number: row.fiscal_id_number as number | null,
              du_type: row.du_type as "DNI" | "LC" | "LE" | null,
              du_number: row.du_number as number | null,
              product_number: row.product_number as number | null,
              cbu: row.cbu as string | null,
              card_brand: row.card_brand as string | null,
              is_new: row.is_new as boolean | null,
              card_number: row.card_number as string | null,
              invoice_number: row.invoice_number as number | null,
              period: row.period as Date | null,
              first_due_amount: row.first_due_amount as number | null,
              first_due_date: row.first_due_date as Date | null,
              second_due_amount: row.second_due_amount as number | null,
              second_due_date: row.second_due_date as Date | null,
              additional_info: row.additional_info as string | null,
              payment_channel: row.payment_channel as string | null,
              payment_date: row.payment_date as Date | null,
              collected_amount: row.collected_amount as number | null,
              comment: row.comment as string | null,
              payment_status: row.payment_status as string | null,
            },
            column,
            reason: zodError.message,
          });
        });
      }
    }
  });

  return { transformedRows, cellsToEdit };
};



export const recHeaders: TableHeaders = [
  { key: "g_c", label: "G.C.", width: 50 },
  { key: "name", label: "Apellido y Nombre", width: 200 },
  { key: "fiscal_id_type", label: "Tipo ID Fiscal", width: 140 },
  { key: "fiscal_id_number", label: "Nro ID Fiscal", width: 140 },
  { key: "du_type", label: "Tipo DU", width: 140 },
  { key: "du_number", label: "Nro DU", width: 140 },
  { key: "product_number", label: "Producto", width: 80, alwaysRequired: true },
  { key: "cbu", label: "Nro CBU", width: 140 },
  { key: "card_brand", label: "TC Marca", width: 140 },
  { key: "is_new", label: "Alta Nueva", width: 140 },
  { key: "card_number", label: "Nro. Tarjeta", width: 140 },
  {
    key: "invoice_number",
    label: "Nro Factura",
    width: 140,
    alwaysRequired: true,
  },
  { key: "period", label: "Período", width: 140 },
  { key: "first_due_amount", label: "Importe 1er Vto.", width: 140 },
  { key: "first_due_date", label: "Fecha 1er Vto.", width: 140 },
  { key: "second_due_amount", label: "Importe 2do Vto.", width: 140 },
  { key: "second_due_date", label: "Fecha 2do. Vto.", width: 140 },
  { key: "additional_info", label: "Info. Adicional", width: 140 },
  { key: "payment_channel", label: "Canal de Cobro", width: 140 },
  { key: "payment_date", label: "Fecha de Pago/Débito", width: 140 },
  { key: "collected_amount", label: "Importe Cobrado", width: 140 },
  { key: "comment", label: "Obs.", width: 140 },
  { key: "payment_status", label: "Estado de Pago", width: 140 },
];

export const columnLabelByKey = Object.fromEntries(
  recHeaders.map((header) => [header.key, header.label]),
) as Record<string, string>;
