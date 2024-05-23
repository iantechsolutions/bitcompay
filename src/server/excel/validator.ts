import { z } from "zod";

export const recRowsTransformer = (rows: Record<string, unknown>[]) => {
  return z.array(recDocumentValidator).parse(rows);
};

export const recDocumentValidator = z
  .object({
    "UNIDAD DE NEGOCIO": z.string().min(0).max(140).nullable().optional(),
    OS: z.string().min(0).max(140).nullable().optional(),
    "OS ORIGEN": z.string().min(0).max(140).nullable().optional(),
    VIGENCIA: z.string().min(0).max(140).nullable().optional(),
    MODO: z.string().min(0).max(140).nullable().optional(),
    BONIFICACION: z.string().min(0).max(140).nullable().optional(),
    "DESDE BONIF.": z.string().min(0).max(140).nullable().optional(),
    "HASTA BONIF.": z.string().min(0).max(140).nullable().optional(),
    "DIFERENCIAL TIPO DOC PROPIO": z
      .string()
      .min(0)
      .max(140)
      .nullable()
      .optional(),
    "NRO DOC PROPIO": z.string().min(0).max(140).nullable().optional(),
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
    DIFERENCIAL: z.string().min(0).max(140).nullable().optional(),
  })
  .transform((value) => {
    // Translated to english
    return {
      "business unit": z.string().min(0).max(140).nullable().optional(),
      os: z.string().min(0).max(140).nullable().optional(),
      "originating os": z.string().min(0).max(140).nullable().optional(),
      validity: z.string().min(0).max(140).nullable().optional(),
      mode: z.string().min(0).max(140).nullable().optional(),
      bonus: z.string().min(0).max(140).nullable().optional(),
      "from bonus": z.string().min(0).max(140).nullable().optional(),
      "to bonus": z.string().min(0).max(140).nullable().optional(),
      "differential own doc type": z
        .string()
        .min(0)
        .max(140)
        .nullable()
        .optional(),
      "own doc number": z.string().min(0).max(140).nullable().optional(),
      pair: z.string().min(0).max(140).nullable().optional(),
      "birth date": z.string().min(0).max(140).nullable().optional(),
      gender: z.string().min(0).max(140).nullable().optional(),
      "marital status": z.string().min(0).max(140).nullable().optional(),
      nationality: z.string().min(0).max(140).nullable().optional(),
      "afip status": z.string().min(0).max(140).nullable().optional(),
      fiscal_id_type: z.string().min(0).max(140).nullable().optional(),
      fiscal_id_number: z.string().min(0).max(140).nullable().optional(),
      city: z.string().min(0).max(140).nullable().optional(),
      district: z.string().min(0).max(140).nullable().optional(),
      address: z.string().min(0).max(140).nullable().optional(),
      floor: z.string().min(0).max(140).nullable().optional(),
      apartment: z.string().min(0).max(140).nullable().optional(),
      "postal code": z.string().min(0).max(140).nullable().optional(),
      phone: z.string().min(0).max(140).nullable().optional(),
      cellphone: z.string().min(0).max(140).nullable().optional(),
      email: z.string().min(0).max(140).nullable().optional(),
      isAffiliated: z.string().min(0).max(140).nullable().optional(),
      isHolder: z.string().min(0).max(140).nullable().optional(),
      isPaymentHolder: z.string().min(0).max(140).nullable().optional(),
      isPaymentResponsible: z.string().min(0).max(140).nullable().optional(),
      "3% contribution": z.string().min(0).max(140).nullable().optional(),
      differential: z.string().min(0).max(140).nullable().optional(),
    };
  });
