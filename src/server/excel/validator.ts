import { z } from "zod";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import type { TableHeaders } from "~/components/table";
import { Value } from "@radix-ui/react-select";
type MonthString =
  | "ENE"
  | "FEB"
  | "MAR"
  | "ABR"
  | "MAY"
  | "JUN"
  | "JUL"
  | "AGO"
  | "SEP"
  | "OCT"
  | "NOV"
  | "DIC";

const AllToDate = z
  .union([z.string(), z.number()])
  .transform((value) => {
    // Convertir números a string
    const stringValue = typeof value === "number" ? value.toString() : value;
    let date: Date | undefined;

    // Caso 1: Si empieza con "x" (formato mes letra año)
    if (typeof stringValue === "string" && stringValue.startsWith("x")) {
      const cleanedValue = stringValue.replace(/^x\s*/, ""); // Eliminar el "x" inicial
      const [monthStr, year] = cleanedValue.split(".");

      const monthMap: Record<MonthString, number> = {
        ENE: 0,
        FEB: 1,
        MAR: 2,
        ABR: 3,
        MAY: 4,
        JUN: 5,
        JUL: 6,
        AGO: 7,
        SEP: 8,
        OCT: 9,
        NOV: 10,
        DIC: 11,
      };
      let month;
      if (monthStr) {
        month = monthMap[monthStr.trim().toUpperCase() as MonthString];
      }
      if (month !== undefined && year) {
        date = new Date(Number(year), month, 1);
      }
    }

    // Caso 2: Si tiene 10 dígitos (formato mes-dia-año)
    else if (typeof stringValue === "string" && stringValue.length === 10) {
      const [day, month, year] = stringValue.split(".");
      date = new Date(Number(year), Number(month) - 1, Number(day));
    }

    // Caso 3: Si tiene 7 dígitos (formato año-mes)
    else if (
      typeof stringValue === "string" &&
      stringValue.length === 7 &&
      stringValue.includes("-")
    ) {
      const [year, month] = stringValue.split("-");
      if (year && month) {
        date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      }
    }

    // Caso 4: Si tiene 4 dígitos (formato año mes)
    else if (typeof stringValue === "string" && stringValue.length === 4) {
      const year = parseInt(stringValue.slice(0, 2), 10) + 2000;
      const month = parseInt(stringValue.slice(2, 4), 10) - 1;
      date = new Date(year, month, 1);
    }

    // Caso 5: Si tiene 6 dígitos (formato año mes sin guion)
    else if (typeof stringValue === "string" && stringValue.length === 6) {
      const year = parseInt(stringValue.slice(0, 4), 10);
      const month = parseInt(stringValue.slice(4, 6), 10) - 1; // Los meses van de 0 a 11 en JavaScript
      date = new Date(year, month, 1);
    }

    // Validar la fecha
    if (!date || isNaN(date.getTime())) {
      throw new Error("Formato de fecha no reconocido");
    }

    return date;
  })
  .refine((value) => dayjs(value).isValid(), {
    message: "Caracteres incorrectos en fecha:",
  });

const stringAsDate = z
  .union([z.string(), z.number()])
  .transform((value) => {
    console.log("Original value:", value);

    let date;

    // Manejar el formato DD/MM/YYYY
    if (typeof value === "string" && /\d{2}\/\d{2}\/\d{4}/.test(value)) {
      date = dayjs(value, "DD/MM/YYYY").toDate();
    }

    // Manejar el formato de meses abreviados (e.g., "AGO.2024")
    else if (
      typeof value === "string" &&
      /^[A-Z]{3}\.\d{4}$/.test(value.replace(/^x\s*/, ""))
    ) {
      const [monthStr, year] = value.split(".");
      let mount = monthStr?.slice(2, 5) ?? "ENE";

      console.log("Original value2:", "1", mount, "1", year, "1");

      const monthMap: { [key: string]: number } = {
        ENE: 0,
        FEB: 1,
        MAR: 2,
        ABR: 3,
        MAY: 4,
        JUN: 5,
        JUL: 6,
        AGO: 7,
        SEP: 8,
        OCT: 9,
        NOV: 10,
        DIC: 11,
      };

      const month = monthMap[mount ?? "ENE"] ?? -1;
      console.log("month:", month);
      if (month !== -1) {
        date = new Date(Number(year), month, 1);
      } else {
        throw new Error("Mes no reconocido");
      }
    }
    console.log("month:", date);

    if (!date && typeof value === "number") {
      date = excelDateToJSDate({ exceldate: Number(value) });
    }

    if (!date || isNaN(date.getTime())) {
      throw new Error("Formato de fecha no reconocido");
    }

    console.log("Converted date:", date);
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
      (typeof value === "string" && !isNaN(Number(value))) ||
      (typeof value === "string" && value == "")
    ) {
      return value.toString();
    }
  })
  .refine((value) => !isNaN(Number(value)) || value == "", {
    message: "Caracteres incorrectos en columna:",
  });

const cardNumber = z
  .union([z.string(), z.number()])
  .transform((v) => v.toString().replace(/\s/g, ""));

const allToString = z
  .union([z.number(), z.string()])
  .transform((value) => {
    console.log(value);
    if (typeof value === "number") {
      return value.toString();
    } else if (typeof value === "string") {
      return value;
    }
  })
  .refine((value) => typeof value === "string", {
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

export const recRowsTransformerOS = (
  rows: Record<string, unknown>[],
  columns: { [key: string]: string }
) => {
  let finishedArrayOS: {
    cuil: string;
    contribution_date: Date | null;
    support_date: Date | null;
    excelAmount: string;
    employer_document_number: string | null;
  }[] = [];

  let errorsOS: z.ZodError<
    {
      cuil: string | null;
      contribution_date: Date | null;
      support_date: Date | null | undefined;
      excelAmount: string;
      employer_document_number: string | null | undefined;
    }[]
  >[] = [];

  rows.map((row) => {
    const validator = recDocumentValidatorOS(columns);
    const resultOS = z.array(validator).safeParse([row]);

    console.log("Cande me ve y se desconecta", resultOS.success);
    if (resultOS.success) {
      let item = resultOS.data[0];
      if (item) {
        console.log("Cande me ve y se desconecta", item.excelAmount);

        finishedArrayOS.push(
          item as {
            cuil: string;
            contribution_date: Date | null;
            support_date: Date | null;
            excelAmount: string;
            employer_document_number: string | null;
          }
        );
      }
    } else {
      errorsOS.push(resultOS.error);
    }
  });

  return { finishedArrayOS, errorsOS };
};

export const recRowsTransformer = (rows: Record<string, unknown>[]) => {
  let finishedArray: {
    business_unit: string | null;
    os: string | null;
    "originating os": string | null;
    validity: Date | null;
    state_date: Date | null;
    mode: string | null;
    bonus: string | null;
    balance: string | null;
    "from bonus": Date | null;
    "to bonus": Date | null;
    state: "ACTIVO" | "INACTIVO" | null;
    holder_id_number: string | null;
    name: string | null;
    own_id_type: "DNI" | "PASAPORTE" | null;
    own_id_number: string | null;
    affiliate_number: string | number | null;
    extention: string | null;
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
    sale_condition: string | null;
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
    seller: string | null;
    supervisor: string | null;
    gerency: string | null;
  }[] = [];
  let errors: z.ZodError<
    {
      "UNIDAD DE NEGOCIO"?: string | null | undefined;
      "SALDO CUENTA CORRIENTE"?: string | number | null | undefined;
      OS?: string | null | undefined;
      "OS ORIGEN"?: string | null | undefined;
      "FECHA DE VIGENCIA"?: string | number | null | undefined;
      "FECHA DE ESTADO"?: string | number | null | undefined;
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
      GENERO?:
        | "MASCULINO"
        | "FEMENINO"
        | "OTRO"
        | "M"
        | "F"
        | "O"
        | null
        | undefined;
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
      "CONDICION DE VENTA": string | null | undefined;
      "ES AFILIADO"?: string | boolean | null | undefined;
      "ES TITULAR"?: string | boolean | null | undefined;
      "ES TITULAR DEL PAGO"?: string | boolean | null | undefined;
      "ES RESP PAGADOR"?: string | boolean | null | undefined;
      "APORTE TOTAL"?: string | number | null | undefined;
      "DIFERENCIAL CODIGO"?: string | null | undefined;
      "DIFERENCIAL VALOR"?: string | number | null | undefined;
      PLAN?: string | null | undefined;
      PRODUCTO?: string | null | undefined;
      "NRO CBU"?: string | number | null | undefined;
      "TC MARCA"?: string | null | undefined;
      "ALTA NUEVA"?: string | boolean | null | undefined;
      "NRO. TARJETA"?: number | null | undefined;
      "TIPO DE TARJETA"?: string | null | undefined;
      VENDEDOR?: string | null | undefined;
      SUPERVISOR?: string | null | undefined;
      GERENCIA?: string | null | undefined;
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

const customEmailRegex = /^[\wñÑ._%+-]+@[a-zñÑ0-9.-]+\.[a-z]{2,}$/i;

export const recDocumentValidatorOS = (columns: { [key: string]: string }) =>
  z
    .object({
      [columns.cuil as string]: allToString.nullable(),
      [columns.contribution_date as string]: AllToDate.nullable(),
      [columns.support_date as string]: AllToDate.nullable().optional(),
      [columns.excelAmount as string]: allToString.nullable().optional(),
      [columns.employer_document_number as string]: allToString
        .nullable()
        .optional(),
    })
    .transform((value) => {
      return {
        cuil: value[columns.cuil ?? "CUIL"] ?? null,
        contribution_date:
          value[columns.contribution_date ?? "PERIODO"] ?? null,
        support_date: value[columns.support_date ?? "PERIODO SOPORTE"] ?? null,
        excelAmount: value[columns.excelAmount ?? "MONTO"] ?? null,
        employer_document_number:
          value[columns.employer_document_number ?? "CUIT"] ?? null,
      };
    });

export const recDocumentValidator = z
  .object({
    "UNIDAD DE NEGOCIO": z
      .string()
      .min(0)
      .max(140, { message: "Ingrese un valor menor a 140 caracteres" })
      .nullable()
      .optional(),
    OS: allToString.nullable().optional(),
    "OS ORIGEN": allToString.nullable().optional(),
    VENDEDOR: allToString.nullable().optional(),
    SUPERVISOR: allToString.nullable().optional(),
    GERENCIA: allToString.nullable().optional(),
    "FECHA DE VIGENCIA": stringAsDate.nullable().optional(),
    "FECHA DE ESTADO": stringAsDate.nullable().optional(),
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
    "NRO DOC TITULAR": allToString.nullable().optional(),
    NOMBRE: z
      .string()
      .min(0)
      .max(140, { message: "Ingrese un valor menor a 140 caracteres" })
      .nullable()
      .optional(),
    "NRO AFILIADO": numberAsString.nullable().optional(),
    EXTENSION: z.string().optional(),
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
      .enum(["MASCULINO", "FEMENINO", "OTRO", "M", "F", "O"])
      .transform((value) => {
        if (value === "M") return "MASCULINO";
        if (value === "F") return "FEMENINO";
        if (value === "O") return "OTRO";
        return value;
      })
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
    "NRO DOC FISCAL": allToString.nullable().optional(),
    LOCALIDAD: z.string().min(0).max(140).nullable().optional(),
    PARTIDO: z.string().min(0).max(140).nullable().optional(),
    DIRECCION: z.union([z.string(), z.number()]).transform((value) => {
      console.log("DIRECCION antes de transformar:", value);
      const stringValue = value.toString();
      console.log("DIRECCION después de transformar:", stringValue);
      return stringValue;
    }),
    PISO: numberAsString.optional().nullable(),
    DEPTO: numberAsString.nullable().optional(),
    CP: numberAsString.nullable().optional(),
    TELEFONO: numberAsString.nullable().optional(),
    CELULAR: numberAsString.nullable().optional(),
    EMAIL: z
      .string()
      // .regex(customEmailRegex, { message: "Correo electrónico no válido" })
      .nullable()
      .optional(),
    "ES AFILIADO": stringAsBoolean.nullable().optional(),
    "CONDICION DE VENTA": z.string().min(0).max(140).nullable().optional(),
    "ES TITULAR": stringAsBoolean.nullable().optional(),
    "ES TITULAR DEL PAGO": stringAsBoolean.nullable().optional(),
    "ES RESP PAGADOR": stringAsBoolean.nullable().optional(),
    "APORTE TOTAL": numberAsString.nullable().optional(),
    "DIFERENCIAL CODIGO": z.string().min(0).max(140).nullable().optional(),
    "DIFERENCIAL VALOR": numberAsString.optional().nullable(),
    "SALDO CUENTA CORRIENTE": numberAsString.nullable().optional(),
    PLAN: allToString.nullable().optional(),
    "PRODUCTO (MEDIO DE PAGO)": z
      .string()
      .max(140, { message: "Ingrese un valor menor a 140 caracteres" })
      .optional()
      .nullable(),
    "NRO CBU": allToString.nullable().optional(),
    "TC MARCA": z
      .string()
      .max(140, { message: "Ingrese un valor menor a 140 caracteres" })
      .nullable()
      .optional(),
    "ALTA NUEVA": stringAsBoolean.nullable().optional(),
    "NRO. TARJETA": cardNumber.nullable().optional(),
    "TIPO DE TARJETA": z.string().nullable().optional(),
    REMUNERACION: numberAsString.optional().nullable(),
    MONOTRIBUTO: numberAsString.optional().nullable(),
    OTROS: numberAsString.optional().nullable(),
    IMPORTE: numberAsString.optional().nullable(),
  })
  .transform((value) => {
    // Translated to english
    return {
      business_unit: value["UNIDAD DE NEGOCIO"] ?? null,
      os: value.OS ?? null,
      "originating os": value["OS ORIGEN"] ?? null,
      seller: value.VENDEDOR ?? null,
      supervisor: value.SUPERVISOR ?? null,
      gerency: value.GERENCIA ?? null,
      validity: value["FECHA DE VIGENCIA"] ?? null,
      state_date: value["FECHA DE ESTADO"] ?? null,
      mode: value.MODO ?? null,
      bonus: value.BONIFICACION ?? "0",
      "from bonus": value["DESDE BONIF."] ?? null,
      "to bonus": value["HASTA BONIF."] ?? null,
      state: value.ESTADO ?? null,
      holder_id_number: value["NRO DOC TITULAR"] ?? null,
      name: value.NOMBRE ?? null,
      own_id_number: value["NRO DOC PROPIO"] ?? null,
      own_id_type: value["TIPO DOC PROPIO"] ?? null,
      affiliate_number: value["NRO AFILIADO"] ?? null,
      extention: value["EXTENSION"] ?? null,
      // du_number: value["NRO DOC PROPIO"] ?? null,
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
      sale_condition: value["CONDICION DE VENTA"] ?? null,
      phone: value.TELEFONO ?? null,
      cellphone: value.CELULAR ?? null,
      email: value.EMAIL ?? null,
      isAffiliated: value["ES AFILIADO"] ?? null,
      isHolder: value["ES TITULAR"] ?? null,
      isPaymentHolder: value["ES TITULAR DEL PAGO"] ?? null,
      isPaymentResponsible: value["ES RESP PAGADOR"] ?? null,
      contribution: value["APORTE TOTAL"] ?? null,
      differential_code: value["DIFERENCIAL CODIGO"] ?? null,
      differential_value: value["DIFERENCIAL VALOR"] ?? "0",
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
  { key: "seller", label: "VENDEDOR", width: 140 },
  { key: "supervisor", label: "SUPERVISOR", width: 140 },
  { key: "gerency", label: "GERENCIA", width: 140 },
  { key: "validity", label: "FECHA DE VIGENCIA", width: 140 },
  { key: "state_date", label: "FECHA ESTADO", width: 140 },
  { key: "mode", label: "MODO", width: 140 },
  { key: "bonus", label: "BONIFICACION" },
  { key: "from bonus", label: "DESDE BONIF." },
  { key: "to bonus", label: "HASTA BONIF." },
  { key: "state", label: "ESTADO", width: 140 },
  { key: "holder_id_number", label: "NRO DOC TITULAR", width: 140 },
  { key: "name", label: "NOMBRE", width: 140 },
  { key: "affiliate_number", label: "NRO AFILIADO", width: 140 },
  { key: "extention", label: "EXTENSION", width: 140 },
  { key: "own_id_type", label: "TIPO DOC PROPIO", width: 140 },
  { key: "own_id_number", label: "NRO DOC PROPIO", width: 140 },
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
  { key: "contribution", label: "APORTE TOTAL" },
  { key: "isAffiliated", label: "ES AFILIADO", width: 140 },
  { key: "isHolder", label: "ES TITULAR", width: 140 },
  { key: "isPaymentHolder", label: "ES TITULAR DEL PAGO", width: 140 },
  { key: "isPaymentResponsible", label: "ES RESP PAGADOR", width: 140 },
  { key: "differential_code", label: "DIFERENCIAL CODIGO", width: 140 },
  { key: "differential_value", label: "DIFERENCIAL VALOR", width: 140 },
  { key: "balance", label: "SALDO CUENTA CORRIENTE", width: 140 },
  { key: "plan", label: "PLAN", width: 140 },
  { key: "product", label: "PRODUCTO", width: 140 },
  { key: "cbu", label: "NRO CBU", width: 140 },
  { key: "card_brand", label: "TC MARCA", width: 140 },
  { key: "is_new", label: "ALTA NUEVA", width: 140 },
  { key: "card_type", label: "TIPO DE TARJETA", width: 140 },
  { key: "card_number", label: "Nro. TARJETA", width: 140 },
  { key: "sale_condition", label: "CONDICION DE VENTA", width: 140 },
];

export const requiredColumns = [
  { key: "business_unit", label: "UNIDAD DE NEGOCIO" },
  // { key: "os", label: "OS" },
  { key: "validity", label: "FECHA DE VIGENCIA" },
  { key: "mode", label: "MODO" },
  { key: "state", label: "ESTADO" },
  { key: "holder_id_number", label: "NRO DOC TITULAR" },
  { key: "name", label: "NOMBRE" },
  { key: "own_id_type", label: "TIPO DOC PROPIO" },
  { key: "own_id_number", label: "NRO DOC PROPIO" },
  // { key: "affiliate_number", label: "NRO AFILIADO" },
  { key: "extention", label: "EXTENSION" },
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
  // { key: "cellphone", label: "CELULAR" },
  { key: "plan", label: "PLAN" },
  { key: "product", label: "PRODUCTO" },
  // { key: "sale_condition", label: "CONDICION DE VENTA" },
];

export const recHeadersOS: TableHeaders = [
  { key: "cuil", label: "CUIL", width: 140 },
  { key: "contribution_date", label: "PERIODO", width: 140 },
  { key: "support_date", label: "PERIODO SOPORTE", width: 140 },
  { key: "excelAmount", label: "MONTO", width: 140 },
  { key: "employer_document_number", label: "CUIT", width: 140 },
];

export const requiredColumnsOS = [
  { key: "cuil", label: "CUIL", width: 140 },
  // { key: "contribution_date", label: "PERIODO", width: 140 },
  { key: "excelAmount", label: "MONTO", width: 140 },
];

export const columnLabelByKey = Object.fromEntries(
  recHeaders.map((header) => {
    return [header.key, header.label];
  })
) as Record<string, string>;

export const keysArray = requiredColumns.map((header) => header.key);

export type RecDocument = z.infer<typeof recDocumentValidator>;
