import { z } from "zod";
import dayjs from "dayjs";
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
    "UNIDAD DE NEGOCIO": z.string().min(0).max(140),
    OS: z.string().min(0).max(140).nullable().optional(),
    "OS ORIGEN": z.string().min(0).max(140).nullable().optional(),
    VIGENCIA: stringAsDate,
    MODO: z.string().min(0).max(140),
    BONIFICACION: z.string().min(0).max(140).nullable().optional(),
    "DESDE BONIF.": z.string().min(0).max(140).nullable().optional(),
    "HASTA BONIF.": z.string().min(0).max(140).nullable().optional(),
    ESTADO: z.string().min(0).max(140).nullable().optional(),
    "NRO DOC TITULAR": numberAsString.nullable().optional(),
    NOMBRE: z.string().min(0).max(140).nullable().optional(),
    "NRO AFILIADO": numberAsString.nullable().optional(),
    EXTENSION: z.string().min(0).max(140).nullable().optional(),
    "TIPO DOC PROPIO": z.string().min(0).max(140).nullable().optional(),
    "NRO DOC PROPIO": numberAsString.nullable().optional(),
    PAR: z.string().min(0).max(140).nullable().optional(),
    "FECHA NACIMIENTO": stringAsDate,
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
    CP: numberAsString,
    TELEFONO: numberAsString.nullable().optional(),
    CELULAR: numberAsString.nullable().optional(),
    EMAIL: z.string().min(0).max(140).nullable().optional(),
    "ES AFILIADO": stringAsBoolean,
    "ES TITULAR": stringAsBoolean,
    "ES TITULAR DEL PAGO": stringAsBoolean,
    "ES RESP PAGADOR": stringAsBoolean,
    "APORTE 3%": numberAsString.nullable().optional(),
    "DIFERENCIAL CODIGO": z.string().min(0).max(140),
    "DIFERENCIAL VALOR": numberAsString,
    PLAN: z.string().min(0).max(140),

    "NRO CBU": numberAsString,
    "TC MARCA": z.string(),
    "ALTA NUEVA": stringAsBoolean,
    "NRO. TARJETA": z.string(),
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
