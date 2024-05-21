import dayjs from 'dayjs'
import 'dayjs/locale/es'
import utc from 'dayjs/plugin/utc'
import { z } from 'zod'
dayjs.extend(utc)
dayjs.locale('es')

export enum Gender {
    Male = 'male',
    Female = 'female',
    Other = 'other',
}

export enum CivilStatus {
    Single = 'single',
    Married = 'married',
    Divorced = 'divorced',
    Widowed = 'widowed',
}

export enum ProviderType {
    Seller = 'vendedor',
    Supervisor = 'supervisor',
    Manager = 'gerente',
}

export enum IdType {
    DNI = 'DNI',
    LC = 'LC',
    LE = 'LE',
}

export enum fiscalIdType {
    CUIT = 'CUIT',
    CUIL = 'CUIL',
}

export const stringAsDate = z
    .string()
    .refine(
        (dob) => {
            new Date(dob).toString() !== 'Invalid Date'
        },
        {
            message: 'Ingrese una fecha valida',
        },
    )
    .transform((value) => {
        return dayjs.utc(value).toDate()
    })
    .or(
        z.date().refine(
            (value) => {
                if (value.getFullYear() < 1900) {
                    return false
                }
                if (value.getFullYear() > 2024) {
                    return false
                }
                return true
            },
            { message: 'ingrese una fecha entre el 2000 y el 3000' },
        ),
    )

export const ProviderSchema = z.object({
    // aca iba id
    // aca iba user
    // aca iba createdAt
    provider_type: z.nativeEnum(ProviderType, {
        errorMap: () => {
            return { message: 'Seleccione un tipo de proveedor valido' }
        },
    }),
    supervisor: z.string().max(255, { message: 'ingrese un supervisor valido' }).optional().nullable(),
    manager: z.string().max(255, { message: 'ingrese un gerente valido' }).optional().nullable(),
    provider_code: z
        .string()
        .max(22, { message: 'ingrese un codigo de proveedor valido' })
        .refine((value) => !Number.isNaN(Number(value)), {
            message: 'ingrese un número valido',
        })
        .optional()
        .nullable(),
    id_type: z.nativeEnum(IdType, {
        errorMap: () => {
            return { message: 'Seleccione un tipo de documento valido' }
        },
    }),
    id_number: z
        .string()
        .max(11, {
            message: 'ingrese un numero de documento de max 11 caracteres',
        })
        .refine((value) => /^\d+$/.test(value), {
            message: 'ingrese un número valido',
        }),
    name: z.string().max(255, { message: 'ingrese de name valido' }),
    afip_status: z.string().max(255, { message: 'ingrese de afip_status valido' }),
    fiscal_id_type: z.nativeEnum(fiscalIdType, {
        errorMap: () => {
            return { message: 'Seleccione un tipo de id fiscal valido' }
        },
    }),
    fiscal_id_number: z
        .string()
        .max(11, { message: 'ingrese un numero de id fiscal de max 11 caracteres' })
        .refine((value) => !Number.isNaN(Number(value)), {
            message: 'ingrese un número de id fiscal valido',
        }),
    gender: z.nativeEnum(Gender, {
        errorMap: () => {
            return { message: 'Seleccione un valor valido' }
        },
    }),
    birth_date: stringAsDate,
    civil_status: z.nativeEnum(CivilStatus, {
        errorMap: () => {
            return { message: 'Seleccione un estado civil valido' }
        },
    }),
    nationality: z.string().max(255),
    address: z.string().max(255),
    phone_number: z
        .string()
        .max(255)
        .refine((value) => /^\d+$/.test(value), {
            message: 'ingrese un número valido',
        }),
    cellphone_number: z.string().refine((value) => /^\d+$/.test(value), {
        message: 'ingrese un número de celular valido',
    }),
    email: z.string().max(255).email({ message: 'ingrese un email valido' }),
    financial_entity: z.string().max(255, { message: 'ingrese un valor valido' }),
    cbu: z
        .string()
        .length(22, { message: 'ingrese un CBU de 22 caracteres' })
        .refine((value) => !Number.isNaN(Number(value)), {
            message: 'ingrese un número valido',
        }),
    status: z.string().max(255, { message: 'ingresar un estado valido' }).optional().nullable(),
    unsubscription_motive: z.string().max(255, { message: 'ingrese un motivo valido' }).optional().nullable(),
})
