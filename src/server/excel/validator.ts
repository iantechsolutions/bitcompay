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

export const recDocumentValidator = z
  .object({
    "UNIDAD DE NEGOCIO": z.string().min(0).max(140),
    OS: z.string().min(0).max(140).nullable().optional(),
    "OS ORIGEN": z.string().min(0).max(140).nullable().optional(),
    VIGENCIA: stringAsDate.nullable().optional(),
    MODO: z.string().min(0).max(140),
    BONIFICACION: z.string().min(0).max(140).nullable().optional(),
    "DESDE BONIF.": z.string().min(0).max(140).nullable().optional(),
    "HASTA BONIF.": z.string().min(0).max(140).nullable().optional(),
    ESTADO: z.string().min(0).max(140).nullable().optional(),
    "NRO DOC TITULAR": z.string().min(0).max(140).nullable().optional(),
    NOMBRE: z.string().min(0).max(140).nullable().optional(),
    "NRO AFILIADO": z.string().min(0).max(140).nullable().optional(),
    EXTENSION: z.string().min(0).max(140).nullable().optional(),
    "TIPO DOC PROPIO": z.string().min(0).max(140).nullable().optional(),
    "NRO DE DOCUMENTO PROPIO": z.string().min(0).max(140).nullable().optional(),
    PAR: z.string().min(0).max(140).nullable().optional(),
    "FECHA NACIMIENTO": z.string().min(0).max(140).nullable().optional(),
    GENERO: z.string().min(0).max(140).nullable().optional(),
    "ESTADO CIVIL": z.string().min(0).max(140).nullable().optional(),
    NACIONALIDAD: z.string().min(0).max(140).nullable().optional(),
    "ESTADO AFIP": z.string().min(0).max(140).nullable().optional(),
    "TIPO DOC FISCAL": z.string().min(0).max(140).nullable().optional(),
    "NRO DOC FISCAL": z.string().min(0).max(140).nullable().optional(),
    LOCALIDAD: z.string().min(0).max(140).nullable().optional(),
    PARTIDO: z.string().min(0).max(140).nullable().optional(),
    DIRECCION: z.string().min(0).max(140).nullable().optional(),
    PISO: z.string().min(0).max(140).nullable().optional(),
    DEPTO: z.string().min(0).max(140).nullable().optional(),
    CP: z.string().min(0).max(140).nullable().optional(),
    TELEFONO: z.string().min(0).max(140).nullable().optional(),
    CELULAR: z.string().min(0).max(140).nullable().optional(),
    EMAIL: z.string().min(0).max(140).nullable().optional(),
    "ES AFILIADO": z.string().min(0).max(140).nullable().optional(),
    "ES TITULAR": z.string().min(0).max(140).nullable().optional(),
    "ES TITULAR DEL PAGO": z.string().min(0).max(140).nullable().optional(),
    "ES RESP PAGADOR": z.string().min(0).max(140).nullable().optional(),
    "APORTE 3%": z.string().min(0).max(140).nullable().optional(),
    "DIFERENCIAL CODIGO": z.string().min(0).max(140).nullable().optional(),
    "DIFERENCIAL VALOR": z.string().min(0).max(140).nullable().optional(),
    PLAN: z.string().min(0).max(140),
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
      own_id_number: value["NRO DE DOCUMENTO PROPIO"] ?? null,
      relationship: value.PAR ?? null,
      "birth date": value["FECHA NACIMIENTO"] ?? null,
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
      "3% contribution": value["APORTE 3%"] ?? null,
      differential_code: value["DIFERENCIAL CODIGO"] ?? null,
      differential_value: value["DIFERENCIAL VALOR"] ?? null,
      plan: value.PLAN ?? null,
    };
  });
