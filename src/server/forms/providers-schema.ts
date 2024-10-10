import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { z } from "zod";
dayjs.extend(utc);
dayjs.locale("es");

export enum Gender {
  Male = "male",
  Female = "female",
  Other = "other",
}

export enum CivilStatus {
  Single = "single",
  Married = "married",
  Divorced = "divorced",
  Widowed = "widowed",
}

export enum ProviderType {
  Seller = "vendedor",
  Supervisor = "supervisor",
  Manager = "gerente",
}

export enum IdType {
  DNI = "DNI",
  LC = "LC",
  LE = "LE",
}

export enum fiscalIdType {
  CUIT = "CUIT",
  CUIL = "CUIL",
}

export const stringAsDate = z
  .string()
  .refine(
    (dob) => {
      new Date(dob).toString() !== "Invalid Date";
    },
    {
      message: "Ingrese una fecha válida",
    }
  )
  .transform((value) => {
    return dayjs.utc(value).toDate();
  })
  .or(
    z.date().refine(
      (value) => {
        if (value.getFullYear() < 1900) {
          return false;
        }
        if (value.getFullYear() > 2024) {
          return false;
        }
        return true;
      },
      { message: "ingrese una fecha entre el 2000 y el 3000" }
    )
  );

export const ProviderSchema = z.object({
  // aca iba id
  // aca iba user
  // aca iba createdAt
  provider_type: z.nativeEnum(ProviderType, {
    errorMap: () => {
      return { message: "Seleccione un tipo de proveedor válido" };
    },
  }),
  supervisor: z
    .string()
    .max(255, { message: "ingrese un supervisor válido" })
    .optional()
    .nullable(),
  manager: z
    .string()
    .max(255, { message: "ingrese un gerente válido" })
    .optional()
    .nullable(),
  provider_code: z
    .string()
    .max(22, { message: "ingrese un codigo de proveedor válido" })
    .refine((value) => !Number.isNaN(Number(value)), {
      message: "ingrese un número válido",
    })
    .optional()
    .nullable(),
  id_type: z.nativeEnum(IdType, {
    errorMap: () => {
      return { message: "Seleccione un tipo de documento válido" };
    },
  }),
  id_number: z
    .string()
    .max(11, {
      message: "ingrese un número de documento de max 11 caracteres",
    })
    .refine((value) => /^\d+$/.test(value), {
      message: "ingrese un número válido",
    }),
  name: z.string().max(255, { message: "ingrese de name válido" }),
  afip_status: z
    .string()
    .max(255, { message: "ingrese de afip_status válido" }),
  fiscal_id_type: z.nativeEnum(fiscalIdType, {
    errorMap: () => {
      return { message: "Seleccione un tipo de id fiscal válido" };
    },
  }),
  fiscal_id_number: z
    .string()
    .max(11, { message: "ingrese un numero de id fiscal de max 11 caracteres" })
    .refine((value) => !Number.isNaN(Number(value)), {
      message: "ingrese un número de id fiscal válido",
    }),
  gender: z.nativeEnum(Gender, {
    errorMap: () => {
      return { message: "Seleccione un valor válido" };
    },
  }),
  birth_date: stringAsDate,
  civil_status: z.nativeEnum(CivilStatus, {
    errorMap: () => {
      return { message: "Seleccione un estado civil válido" };
    },
  }),
  nationality: z.string().max(255),
  address: z.string().max(140),
  phone_number: z
    .string()
    .max(255)
    .refine((value) => /^\d+$/.test(value), {
      message: "ingrese un número válido",
    }),
  cellphone_number: z.string().refine((value) => /^\d+$/.test(value), {
    message: "ingrese un número de celular válido",
  }),
  email: z
    .string()
    .max(255)
    .refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
      message: "Ingrese un email válido con caracteres válidos",
    }),
  financial_entity: z.string().max(255, { message: "ingrese un valor valido" }),
  cbu: z
    .string()
    .length(22, { message: "ingrese un CBU de 22 caracteres" })
    .refine((value) => !Number.isNaN(Number(value)), {
      message: "ingrese un número válido",
    }),
  status: z
    .string()
    .max(255, { message: "ingresar un estado válido" })
    .optional()
    .nullable(),
  unsubscription_motive: z
    .string()
    .max(255, { message: "ingrese un motivo válido" })
    .optional()
    .nullable(),
});
