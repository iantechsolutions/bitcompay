import { z } from "zod";
import dayjs from "dayjs";
import type { TableHeaders } from "~/components/table";
const stringAsDate = z
  .union([z.string(), z.number()])
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

export const recRowsTransformer = (rows: Record<string, unknown>[]) => {
  return z.array(recDocumentValidator).parse(rows);
};

const stringAsBoolean = z
  .union([z.string(), z.boolean()])
  .nullable()
  .optional()
  .transform((value) => {
    if (value === undefined || value === null || value === "") {
      return false;
    }
    if (typeof value === "string" && value.toLowerCase() === "verdadero") {
      return true;
    }
    if (typeof value === "boolean") {
      return value;
    }
    throw new Error("invalid boolean value");
  });

const numberAsString = z.union([z.number(), z.string()]).transform((value) => {
  if (
    typeof value === "number" ||
    (typeof value === "string" && !isNaN(Number(value)))
  ) {
    return value.toString();
  }
});

export const recDocumentValidator = z
  .object({
    "UNIDAD DE NEGOCIO": z.string().min(0).max(140).nullable().optional(),
    OS: z.string().min(0).max(140).nullable().optional(),
    "OS ORIGEN": z.string().min(0).max(140).nullable().optional(),
    VIGENCIA: stringAsDate.nullable().optional(),
    MODO: z.string().min(0).max(140).nullable().optional(),
    BONIFICACION: z.string().min(0).max(140).nullable().optional(),
    "DESDE BONIF.": stringAsDate.nullable().optional(),
    "HASTA BONIF.": stringAsDate.nullable().optional(),
    ESTADO: z.string().min(0).max(140).nullable().optional(),
    "NRO DOC TITULAR": numberAsString.nullable().optional(),
    NOMBRE: z.string().min(0).max(140).nullable().optional(),
    "NRO AFILIADO": numberAsString.nullable().optional(),
    EXTENSION: z.string().min(0).max(140).nullable().optional(),
    "TIPO DOC PROPIO": z.string().min(0).max(140).nullable().optional(),
    "NRO DOC PROPIO": numberAsString.nullable().optional(),
    PAR: z.string().min(0).max(140).nullable().optional(),
    "FECHA NACIMIENTO": stringAsDate.nullable().optional(),
    GENERO: z.enum(["male", "female", "other"]).nullable().optional(),
    "ESTADO CIVIL": z
      .enum(["casado", "soltero", "divorciado", "viudo"])
      .nullable()
      .optional(),
    NACIONALIDAD: z.string().min(0).max(140).nullable().optional(),
    "ESTADO AFIP": z.string().min(0).max(140).nullable().optional(),
    "TIPO DOC FISCAL": z.string().min(0).max(140).nullable().optional(),
    "NRO DOC FISCAL": numberAsString.nullable().optional(),
    LOCALIDAD: z.string().min(0).max(140).nullable().optional(),
    PARTIDO: z.string().min(0).max(140).nullable().optional(),
    DIRECCION: z.string().min(0).max(140).nullable().optional(),
    PISO: numberAsString.optional().nullable(),
    DEPTO: numberAsString.nullable().optional(),
    CP: numberAsString.nullable().optional(),
    TELEFONO: numberAsString.nullable().optional(),
    CELULAR: numberAsString.nullable().optional(),
    EMAIL: z.string().min(0).max(140).nullable().optional(),
    "ES AFILIADO": stringAsBoolean.nullable().optional(),
    "ES TITULAR": stringAsBoolean.nullable().optional(),
    "ES TITULAR DEL PAGO": stringAsBoolean.nullable().optional(),
    "ES RESP PAGADOR": stringAsBoolean.nullable().optional(),
    "APORTE 3%": numberAsString.nullable().optional(),
    "DIFERENCIAL CODIGO": z.string().min(0).max(140).nullable().optional(),
    "DIFERENCIAL VALOR": numberAsString.optional().nullable(),
    PLAN: z.string().min(0).max(140).nullable().optional(),

    "NRO CBU": numberAsString.nullable().optional(),
    "TC MARCA": z.string().nullable().optional(),
    "ALTA NUEVA": stringAsBoolean.nullable().optional(),
    "NRO. TARJETA": numberAsString.nullable().optional(),
  })
  .transform((value) => {
    // Translated to english
    return {
      business_unit: value["UNIDAD DE NEGOCIO"] ?? null,
      os: value.OS ?? null,
      "originating os": value["OS ORIGEN"] ?? null,
      validity: value.VIGENCIA ?? null,
      mode: value.MODO ?? null,
      bonus: value.BONIFICACION ?? "0",
      "from bonus": value["DESDE BONIF."] ?? null,
      "to bonus": value["HASTA BONIF."] ?? null,
      state: value.ESTADO ?? null,
      holder_id_number: value["NRO DOC TITULAR"] ?? null,
      name: value.NOMBRE ?? null,
      affiliate_number: value["NRO AFILIADO"] ?? null,
      extension: value.EXTENSION ?? null,
      own_id_type: value["TIPO DOC PROPIO"] ?? null,
      own_id_number: value["NRO DOC PROPIO"] ?? null,
      relationship: value.PAR ?? null,
      birth_date: value["FECHA NACIMIENTO"] ?? null,
      gender: value.GENERO ?? null,
      "marital status": value["ESTADO CIVIL"] ?? null,
      nationality: value.NACIONALIDAD ?? null,
      "afip status": value["ESTADO AFIP"] ?? null,
      fiscal_id_type: value["TIPO DOC FISCAL"] ?? null,
      fiscal_id_number: value["NRO DOC FISCAL"] ?? null,
      city: value.LOCALIDAD ?? null,
      district: value.PARTIDO ?? null,
      address: value.DIRECCION ?? null,
      floor: value.PISO ?? null,
      apartment: value.DEPTO ?? null,
      "postal code": value.CP ?? null,
      phone: value.TELEFONO ?? null,
      cellphone: value.CELULAR ?? null,
      email: value.EMAIL ?? null,
      isAffiliated: value["ES AFILIADO"] ?? null,
      isHolder: value["ES TITULAR"] ?? null,
      isPaymentHolder: value["ES TITULAR DEL PAGO"] ?? null,
      isPaymentResponsible: value["ES RESP PAGADOR"] ?? null,
      contribution: value["APORTE 3%"] ?? null,
      differential_code: value["DIFERENCIAL CODIGO"] ?? null,
      differential_value: value["DIFERENCIAL VALOR"],
      plan: value.PLAN ?? null,

      cbu_number: value["NRO CBU"] ?? null,
      card_brand: value["TC MARCA"] ?? null,
      new_registration: value["ALTA NUEVA"] ?? null,
      card_number: value["NRO. TARJETA"] ?? null,
    };
  });

export const recHeaders: TableHeaders = [
  { key: "business_unit", label: "UNIDAD DE NEGOCIO", width: 140 },
  { key: "os", label: "OS", width: 140 },
  { key: "originating_os", label: "OS ORIGEN", width: 140 },
  { key: "validity", label: "VIGENCIA", width: 140 },
  { key: "mode", label: "MODO", width: 140 },
  { key: "bonus", label: "BONIFICACION", width: 140 },
  { key: "from_bonus", label: "DESDE BONIF.", width: 140 },
  { key: "to_bonus", label: "HASTA BONIF.", width: 140 },
  { key: "state", label: "ESTADO", width: 140 },
  { key: "holder_id_number", label: "NRO DOC TITULAR", width: 140 },
  { key: "name", label: "NOMBRE", width: 140 },
  { key: "affiliate_number", label: "NRO AFILIADO", width: 140 },
  { key: "extension", label: "EXTENSION", width: 140 },
  { key: "own_id_type", label: "TIPO DOC PROPIO", width: 140 },
  { key: "own_id_number", label: "NRO DOC PROPIO", width: 140 },
  { key: "relationship", label: "PAR", width: 140 },
  { key: "birth_date", label: "FECHA NACIMIENTO", width: 140 },
  { key: "gender", label: "GENERO", width: 140 },
  { key: "marital_status", label: "ESTADO CIVIL", width: 140 },
  { key: "nationality", label: "NACIONALIDAD", width: 140 },
  { key: "afip_status", label: "ESTADO AFIP", width: 140 },
  { key: "fiscal_id_type", label: "TIPO DOC FISCAL", width: 140 },
  { key: "fiscal_id_number", label: "NRO DOC FISCAL", width: 140 },
  { key: "city", label: "LOCALIDAD", width: 140 },
  { key: "district", label: "PARTIDO", width: 140 },
  { key: "address", label: "DIRECCION", width: 140 },
  { key: "floor", label: "PISO", width: 140 },
  { key: "apartment", label: "DEPTO", width: 140 },
  { key: "postal_code", label: "CP", width: 140 },
  { key: "phone", label: "TELEFONO", width: 140 },
  { key: "cellphone", label: "CELULAR", width: 140 },
  { key: "email", label: "EMAIL", width: 140 },
  { key: "isAffiliated", label: "ES AFILIADO", width: 140 },
  { key: "isHolder", label: "ES TITULAR", width: 140 },
  { key: "isPaymentHolder", label: "ES TITULAR DEL PAGO", width: 140 },
  { key: "isPaymentResponsible", label: "ES RESP PAGADOR", width: 140 },
  { key: "contribution", label: "APORTE 3%", width: 140 },
  { key: "differential_code", label: "DIFERENCIAL CODIGO", width: 140 },
  { key: "differential_value", label: "DIFERENCIAL VALOR", width: 140 },
  { key: "plan", label: "PLAN", width: 140 },
  { key: "cbu_number", label: "NRO CBU", width: 140 },
  { key: "card_brand", label: "TC MARCA", width: 140 },
  { key: "new_registration", label: "ALTA NUEVA", width: 140 },
  { key: "card_number", label: "Nro. TARJETA", width: 140 },
];

export const columnLabelByKey = Object.fromEntries(
  recHeaders
    .filter(
      (header) =>
        header.key !== "card_number" &&
        header.key !== "card_brand" &&
        header.key !== "new_registration" &&
        header.key !== "cbu_number"
    )
    .map((header) => {
      return [header.key, header.label];
    })
) as Record<string, string>;

export const keysArray = recHeaders.map((header) => header.key);

export type RecDocument = z.infer<typeof recDocumentValidator>;
