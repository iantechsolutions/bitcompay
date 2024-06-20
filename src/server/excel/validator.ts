import { z } from "zod";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import type { TableHeaders } from "~/components/table";
import { Value } from "@radix-ui/react-select";
const stringAsDate = z
  .union([z.string(), z.number()])
  .transform((value) => {
    const date = excelDateToJSDate({ exceldate: Number(value) });
    console.log(value);

    return date;
  })
  .refine(
    (value) => {
      if (value.getFullYear() < 1500) return false;
      if (value.getFullYear() > 3000) return false;

      return dayjs(value).isValid();
    },
    { message: "Caracteres incorrectos en columna:" }
  );

function excelDateToJSDate({ exceldate }: { exceldate: number }) {
  const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
  const jsDate = new Date(excelEpoch.getTime() + exceldate * 86400000);
  return jsDate;
}

const stringAsBoolean = z
  .union([z.string(), z.boolean()])
  .nullable()
  .optional()
  .transform((value) => {
    if (
      (typeof value === "string" && value.toLowerCase() === "verdadero") ||
      (typeof value === "string" && value.toLowerCase() === "si")
    ) {
      return true;
    }
    if (
      (typeof value === "string" && value.toLowerCase() === "falso") ||
      (typeof value === "string" && value.toLowerCase() === "no")
    ) {
      return false;
    }
    if (typeof value === "boolean") {
      return value;
    }
    if (!value || value == "") {
      return false;
    }
  })
  .refine((value) => typeof value === "boolean", {
    message: "Caracteres incorrectos en columna:",
  });

const numberAsString = z
  .union([z.number(), z.string()])
  .transform((value) => {
    console.log(value);
    if (
      typeof value === "number" ||
      (typeof value === "string" && !isNaN(Number(value)))
    ) {
      return value.toString();
    }
  })
  .refine((value) => !isNaN(Number(value)), {
    message: "Caracteres incorrectos en columna:",
  });

const bonusAsString = z
  .union([z.number(), z.string()])
  .transform((value) => {
    console.log(value);
    if (typeof value === "number") {
      if (value < 1) {
        return (value * 100).toString();
      }
      return value.toString();
    }
  })
  .refine((value) => !isNaN(Number(value)), {
    message: "Caracteres incorrectos en columna:",
  });

export const recRowsTransformer = (rows: Record<string, unknown>[]) => {
  let finishedArray: {
    business_unit: string | null;
    os: string | null;
    "originating os": string | null;
    validity: Date | null;
    mode: string | null;
    bonus: string | null;
    balance: string | null;
    "from bonus": Date | null;
    "to bonus": Date | null;
    state: "ACTIVO" | "INACTIVO" | null;
    holder_id_number: string | null;
    name: string | null;
    affiliate_number: string | null;
    extension: string | null;
    own_id_type: "DNI" | "PASAPORTE" | null;
    du_number: string | null;
    relationship: string | null;
    birth_date: Date | null;
    gender: "MASCULINO" | "FEMENINO" | "OTRO" | null;
    "marital status": "CASADO" | "SOLTERO" | "DIVORCIADO" | "VIUDO" | null;
    nationality: string | null;
    "afip status":
      | "CONSUMIDOR FINAL"
      | "MONOTRIBUTISTA"
      | "EXENTO"
      | "RESPONSABLE INSCRIPTO"
      | null;
    fiscal_id_type: "CUIT" | "CUIL" | null;
    fiscal_id_number: string | null;
    city: string | null;
    district: string | null;
    address: string | null;
    floor: string | null;
    apartment: string | null;
    "postal code": string | null;
    phone: string | null;
    cellphone: string | null;
    email: string | null;
    isAffiliated: boolean | null;
    isHolder: boolean | null;
    isPaymentHolder: boolean | null;
    isPaymentResponsible: boolean | null;
    contribution: string | null;
    differential_code: string | null;
    differential_value: string | null | undefined;
    plan: string | null;
    product: string | null;
    cbu: string | null;
    card_brand: string | null;
    is_new: boolean | null;
    card_number: string | null;
    card_type: string | null;
  }[] = [];
  let errors: z.ZodError<
    {
      "UNIDAD DE NEGOCIO"?: string | null | undefined;
      "SALDO CUENTA CORRIENTE"?: string | number | null | undefined;
      OS?: string | null | undefined;
      "OS ORIGEN"?: string | null | undefined;
      VIGENCIA?: string | number | null | undefined;
      MODO?: string | null | undefined;
      BONIFICACION?: string | null | undefined;
      "DESDE BONIF."?: string | number | null | undefined;
      "HASTA BONIF."?: string | number | null | undefined;
      ESTADO?: "ACTIVO" | "INACTIVO" | null | undefined;
      "NRO DOC TITULAR"?: string | number | null | undefined;
      NOMBRE?: string | null | undefined;
      "NRO AFILIADO"?: string | number | null | undefined;
      EXTENSION?: string | null | undefined;
      "TIPO DOC PROPIO"?: "DNI" | "PASAPORTE" | null | undefined;
      "NRO DOC PROPIO"?: string | number | null | undefined;
      PAR?: string | null | undefined;
      "FECHA NACIMIENTO"?: string | number | null | undefined;
      GENERO?: "MASCULINO" | "FEMENINO" | "OTRO" | null | undefined;
      "ESTADO CIVIL"?:
        | "CASADO"
        | "SOLTERO"
        | "DIVORCIADO"
        | "VIUDO"
        | null
        | undefined;
      NACIONALIDAD?: string | null | undefined;
      "ESTADO AFIP"?:
        | "CONSUMIDOR FINAL"
        | "MONOTRIBUTISTA"
        | "EXENTO"
        | "RESPONSABLE INSCRIPTO"
        | null
        | undefined;
      "TIPO DOC FISCAL"?: "CUIT" | "CUIL" | null | undefined;
      "NRO DOC FISCAL"?: string | number | null | undefined;
      LOCALIDAD?: string | null | undefined;
      PARTIDO?: string | null | undefined;
      DIRECCION?: string | null | undefined;
      PISO?: string | number | null | undefined;
      DEPTO?: string | number | null | undefined;
      CP?: string | number | null | undefined;
      TELEFONO?: string | number | null | undefined;
      CELULAR?: string | number | null | undefined;
      EMAIL?: string | null | undefined;
      "ES AFILIADO"?: string | boolean | null | undefined;
      "ES TITULAR"?: string | boolean | null | undefined;
      "ES TITULAR DEL PAGO"?: string | boolean | null | undefined;
      "ES RESP PAGADOR"?: string | boolean | null | undefined;
      "APORTE 3%"?: string | number | null | undefined;
      "DIFERENCIAL CODIGO"?: string | null | undefined;
      "DIFERENCIAL VALOR"?: string | number | null | undefined;
      PLAN?: string | null | undefined;
      PRODUCTO?: string | null | undefined;
      "NRO CBU"?: string | number | null | undefined;
      "TC MARCA"?: string | null | undefined;
      "ALTA NUEVA"?: string | boolean | null | undefined;
      "NRO. TARJETA"?: string | number | null | undefined;
      "TIPO DE TARJETA"?: string | null | undefined;
    }[]
  >[] = [];
  rows.map((row) => {
    const result = z.array(recDocumentValidator).safeParse([row]);
    if (result.success) {
      const item = result.data[0];
      if (item) {
        finishedArray.push(item);
      }
    } else {
      errors.push(result.error);
    }
  });
  return { finishedArray, errors };
};

export const recDocumentValidator = z
  .object({
    "UNIDAD DE NEGOCIO": z
      .string()
      .min(0)
      .max(140, { message: "Ingrese un valor menor a 140 caracteres" })
      .nullable()
      .optional(),
    OS: z
      .string()
      .min(0)
      .max(140, { message: "Ingrese un valor menor a 140 caracteres" })
      .nullable()
      .optional(),
    "OS ORIGEN": z
      .string()
      .min(0)
      .max(140, { message: "Ingrese un valor menor a 140 caracteres" })
      .nullable()
      .optional(),
    VIGENCIA: stringAsDate.nullable().optional(),
    MODO: z
      .string()
      .min(0)
      .max(140, { message: "Ingrese un valor menor a 140 caracteres" })
      .nullable()
      .optional(),
    BONIFICACION: bonusAsString.nullable().optional(),
    "DESDE BONIF.": stringAsDate.nullable().optional(),
    "HASTA BONIF.": stringAsDate.nullable().optional(),
    ESTADO: z
      .enum(["ACTIVO", "INACTIVO"])
      .refine((value) => ["ACTIVO", "INACTIVO"].includes(value), {
        message: "El estado debe ser 'ACTIVO' o 'INACTIVO'",
      })
      .nullable()
      .optional(),
    "NRO DOC TITULAR": numberAsString.nullable().optional(),
    NOMBRE: z
      .string()
      .min(0)
      .max(140, { message: "Ingrese un valor menor a 140 caracteres" })
      .nullable()
      .optional(),
    "NRO AFILIADO": z
      .string()
      .min(0)
      .max(140, { message: "Ingrese un valor menor a 140 caracteres" })
      .nullable()
      .optional(),
    EXTENSION: z
      .string()
      .min(0)
      .max(140, { message: "Ingrese un valor menor a 140 caracteres" })
      .nullable()
      .optional(),
    "TIPO DOC PROPIO": z
      .enum(["DNI", "PASAPORTE"])
      .refine((value) => ["DNI", "PASAPORTE"].includes(value), {
        message: "El tipo de documento debe ser DNI o PASAPORTE",
      })
      .nullable()
      .optional(),
    "NRO DOC PROPIO": numberAsString.nullable().optional(),
    PAR: z
      .string()
      .min(0)
      .max(140, { message: "Ingrese un valor menor a 140 caracteres" })
      .nullable()
      .optional(),
    "FECHA NACIMIENTO": stringAsDate.nullable().optional(),
    GENERO: z
      .enum(["MASCULINO", "FEMENINO", "OTRO"])
      .refine((value) => ["MASCULINO", "FEMENINO", "OTRO"].includes(value), {
        message: "El genero debe ser 'MASCULINO', 'FEMENINO' o 'OTRO'",
      })
      .nullable()
      .optional(),
    "ESTADO CIVIL": z
      .enum(["CASADO", "SOLTERO", "DIVORCIADO", "VIUDO"])
      .refine(
        (value) => ["CASADO", "SOLTERO", "DIVORCIADO", "VIUDO"].includes(value),
        {
          message:
            "El estado civil debe ser 'CASADO', 'SOLTERO', 'DIVORCIADO' o 'VIUDO'",
        }
      )
      .nullable()
      .optional(),
    NACIONALIDAD: z
      .string()
      .min(0)
      .max(140, { message: "Ingrese un valor menor a 140 caracteres" })
      .nullable()
      .optional(),
    "ESTADO AFIP": z
      .enum([
        "CONSUMIDOR FINAL",
        "MONOTRIBUTISTA",
        "EXENTO",
        "RESPONSABLE INSCRIPTO",
      ])
      .nullable()
      .optional(),
    "TIPO DOC FISCAL": z.enum(["CUIT", "CUIL"]).nullable().optional(),
    "NRO DOC FISCAL": numberAsString.nullable().optional(),
    LOCALIDAD: z.string().min(0).max(140).nullable().optional(),
    PARTIDO: z.string().min(0).max(140).nullable().optional(),
    DIRECCION: z.string().min(0).max(140).nullable().optional(),
    PISO: numberAsString.optional().nullable(),
    DEPTO: numberAsString.nullable().optional(),
    CP: numberAsString.nullable().optional(),
    TELEFONO: numberAsString.nullable().optional(),
    CELULAR: numberAsString.nullable().optional(),
    EMAIL: z
      .string()
      .email({ message: "Ingrese un email valido" })
      .nullable()
      .optional(),
    "ES AFILIADO": stringAsBoolean.nullable().optional(),
    "ES TITULAR": stringAsBoolean.nullable().optional(),
    "ES TITULAR DEL PAGO": stringAsBoolean.nullable().optional(),
    "ES RESP PAGADOR": stringAsBoolean.nullable().optional(),
    "APORTE 3%": numberAsString.nullable().optional(),
    "DIFERENCIAL CODIGO": z.string().min(0).max(140).nullable().optional(),
    "DIFERENCIAL VALOR": numberAsString.optional().nullable(),
    "SALDO CUENTA CORRIENTE": numberAsString.nullable().optional(),
    PLAN: z.string().min(0).max(140).nullable().optional(),
    "PRODUCTO (MEDIO DE PAGO)": z
      .string()
      .max(140, { message: "Ingrese un valor menor a 140 caracteres" })
      .optional()
      .nullable(),
    "NRO CBU": numberAsString.nullable().optional(),
    "TC MARCA": z
      .string()
      .max(140, { message: "Ingrese un valor menor a 140 caracteres" })
      .nullable()
      .optional(),
    "ALTA NUEVA": stringAsBoolean.nullable().optional(),
    "NRO. TARJETA": numberAsString.nullable().optional(),
    "TIPO DE TARJETA": z.string().nullable().optional(),
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
      du_number: value["NRO DOC PROPIO"] ?? null,
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
      balance: value["SALDO CUENTA CORRIENTE"] ?? null,
      plan: value.PLAN ?? null,
      product: value["PRODUCTO (MEDIO DE PAGO)"] ?? null,
      cbu: value["NRO CBU"] ?? null,
      card_brand: value["TC MARCA"] ?? null,
      is_new: value["ALTA NUEVA"] ?? null,
      card_number: value["NRO. TARJETA"] ?? null,
      card_type: value["TIPO DE TARJETA"] ?? null,
    };
  });

export const recHeaders: TableHeaders = [
  { key: "business_unit", label: "UNIDAD DE NEGOCIO", width: 140 },
  { key: "os", label: "OS", width: 140 },
  { key: "originating os", label: "OS ORIGEN", width: 140 },
  { key: "validity", label: "VIGENCIA", width: 140 },
  { key: "mode", label: "MODO", width: 140 },
  { key: "bonus", label: "BONIFICACION" },
  { key: "from bonus", label: "DESDE BONIF." },
  { key: "to bonus", label: "HASTA BONIF." },
  { key: "state", label: "ESTADO", width: 140 },
  { key: "holder_id_number", label: "NRO DOC TITULAR", width: 140 },
  { key: "name", label: "NOMBRE", width: 140 },
  { key: "affiliate_number", label: "NRO AFILIADO", width: 140 },
  { key: "extension", label: "EXTENSION", width: 140 },
  { key: "du_type", label: "TIPO DOC PROPIO", width: 140 },
  { key: "du_number", label: "NRO DOC PROPIO", width: 140 },
  { key: "relationship", label: "PAR", width: 140 },
  { key: "birth_date", label: "FECHA NACIMIENTO", width: 140 },
  { key: "gender", label: "GENERO", width: 140 },
  { key: "marital status", label: "ESTADO CIVIL", width: 140 },
  { key: "nationality", label: "NACIONALIDAD", width: 140 },
  { key: "afip status", label: "ESTADO AFIP", width: 140 },
  { key: "fiscal_id_type", label: "TIPO DOC FISCAL", width: 140 },
  { key: "fiscal_id_number", label: "NRO DOC FISCAL", width: 140 },
  { key: "district", label: "PARTIDO", width: 140 },
  { key: "address", label: "DIRECCION", width: 140 },
  { key: "floor", label: "PISO", width: 140 },
  { key: "apartment", label: "DEPTO", width: 140 },
  { key: "postal code", label: "CP", width: 140 },
  { key: "phone", label: "TELEFONO", width: 140 },
  { key: "cellphone", label: "CELULAR", width: 140 },
  { key: "email", label: "EMAIL", width: 140 },
  { key: "contribution", label: "APORTE 3%" },
  { key: "isAffiliated", label: "ES AFILIADO", width: 140 },
  { key: "isHolder", label: "ES TITULAR", width: 140 },
  { key: "isPaymentHolder", label: "ES TITULAR DEL PAGO", width: 140 },
  { key: "isPaymentResponsible", label: "ES RESP PAGADOR", width: 140 },
  { key: "differential_code", label: "DIFERENCIAL CODIGO", width: 140 },
  { key: "differential_value", label: "DIFERENCIAL VALOR", width: 140 },
  { key: "balance", label: "SALDO CUENTA CORRIENTE", width: 140 },
  { key: "plan", label: "PLAN", width: 140 },
  { key: "product_number", label: "PRODUCTO", width: 140 },
  { key: "cbu", label: "NRO CBU", width: 140 },
  { key: "card_brand", label: "TC MARCA", width: 140 },
  { key: "is_new", label: "ALTA NUEVA", width: 140 },
  { key: "card_type", label: "TIPO DE TARJETA", width: 140 },
  { key: "card_number", label: "Nro. TARJETA", width: 140 },
];

export const requiredColumns = [
  { key: "business_unit", label: "UNIDAD DE NEGOCIO" },
  { key: "os", label: "OS" },
  { key: "validity", label: "VIGENCIA" },
  { key: "mode", label: "MODO" },
  { key: "state", label: "ESTADO" },
  { key: "holder_id_number", label: "NRO DOC TITULAR" },
  { key: "name", label: "NOMBRE" },
  { key: "affiliate_number", label: "NRO AFILIADO" },
  { key: "extension", label: "EXTENSION" },
  { key: "own_id_type", label: "TIPO DOC PROPIO" },
  { key: "du_number", label: "NRO DOC PROPIO" },
  { key: "relationship", label: "PAR" },
  { key: "birth_date", label: "FECHA NACIMIENTO" },
  { key: "gender", label: "GENERO" },
  { key: "marital status", label: "ESTADO CIVIL" },
  { key: "nationality", label: "NACIONALIDAD" },
  { key: "afip status", label: "ESTADO AFIP" },
  { key: "fiscal_id_type", label: "TIPO DOC FISCAL" },
  { key: "fiscal_id_number", label: "NRO DOC FISCAL" },
  { key: "district", label: "PARTIDO" },
  { key: "address", label: "DIRECCION" },
  { key: "postal code", label: "CP" },
  { key: "cellphone", label: "CELULAR" },
  { key: "email", label: "EMAIL" },
  { key: "plan", label: "PLAN" },
  { key: "product", label: "PRODUCTO" },
];

export const columnLabelByKey = Object.fromEntries(
  recHeaders.map((header) => {
    return [header.key, header.label];
  })
) as Record<string, string>;

export const keysArray = requiredColumns.map((header) => header.key);

export type RecDocument = z.infer<typeof recDocumentValidator>;
