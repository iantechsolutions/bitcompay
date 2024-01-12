import dayjs from "dayjs"
import { z } from "zod"
import { TableHeaders } from "~/components/table"

export type DOCRowsValidatorAndTransformer = (rows: Record<string, any>[]) => Record<string, any>[]

const stringToValidIntegerZodTransformer = z.string().or(z.number()).transform(v => parseInt(v.toString())).refine(Number.isInteger)

const nullableStringToValidIntegerZodTransformer = z.string().or(z.number()).nullable().optional().transform(v => {
    if (!v || v?.toString().trim() === '') return null
    return parseInt(v.toString())
}).refine(v => v == null ? true : Number.isInteger(v))

const stringAsDate = z.string().or(z.number()).transform((value) => {
    if (typeof value === 'number') {
        value = value.toString().padStart(8, '0')
    }

    const last4 = parseInt(value.substring(4, 8))

    let day = value.substring(6, 8)
    let month = value.substring(4, 6)
    let year = value.substring(0, 4)

    if (last4 > 2000) {
        day = value.substring(0, 2)
        month = value.substring(2, 4)
        year = value.substring(4, 8)
    }

    return dayjs(`${year}-${month}-${day}`).toDate()
})

const stringAsPeriod = z.string().transform((value) => {
    return dayjs(value, "MMYYYY").toDate()
})

export const recDocumentValidator = z.object({
    "G.C.": z.number().int().min(0).max(14000).nullable().optional(),
    "Apellido y Nombre": z.string().min(1).max(140).nullable().optional(),
    "Tipo ID Fiscal": z.literal("CUIT").or(z.literal("CUIL")).nullable().optional(),
    "Nro ID Fiscal": stringToValidIntegerZodTransformer.nullable().optional(),
    "Tipo DU": z.literal("DNI").or(z.literal("LC")).or(z.literal("LE")).nullable().optional(),
    "Nro DU": stringToValidIntegerZodTransformer.nullable().optional(),
    "Canal": z.string().min(1).max(140).nullable().optional(),
    // NOT OPTIONAL!!!
    "Nro Factura": stringToValidIntegerZodTransformer,
    //
    "Período": stringAsPeriod.nullable().optional(),
    "Importe 1er Vto.": stringToValidIntegerZodTransformer.nullable().optional(),
    "Fecha 1er Vto.": stringAsDate.nullable().optional(),
    "Importe 2do Vto.": stringToValidIntegerZodTransformer.nullable().optional(),
    "Fecha 2do. Vto.": stringAsDate.nullable().optional(),
    "Info. Adicional": z.string().min(1).max(140).catch('').nullable().optional(),
    "Canal de Cobro": z.string().min(0).max(140).catch('').nullable().optional(),
    "Fecha de Pago/Débito": stringAsDate.nullable().optional(),
    "Importe Cobrado": nullableStringToValidIntegerZodTransformer.nullable().optional(),
}).transform((value) => {

    // Translated to english
    return {
        'g_c': value['G.C.'] ?? null,
        'name': value['Apellido y Nombre'] ?? null,
        'fiscal_id_type': value['Tipo ID Fiscal'] ?? null,
        'fiscal_id_number': value['Nro ID Fiscal'] ?? null,
        'du_type': value['Tipo DU'] ?? null,
        'du_number': value['Nro DU'] ?? null,
        'channel': value['Canal'] ?? null,
        'invoice_number': value['Nro Factura'] ?? null,
        'period': value['Período'] ?? null,
        'first_due_amount': value['Importe 1er Vto.'] ?? null,
        'first_due_date': value['Fecha 1er Vto.'] ?? null,
        'second_due_amount': value['Importe 2do Vto.'] ?? null,
        'second_due_date': value['Fecha 2do. Vto.'] ?? null,
        'additional_info': value['Info. Adicional'] ?? null,
        'payment_channel': value['Canal de Cobro'] ?? null,
        'payment_date': value['Fecha de Pago/Débito'] ?? null,
        'collected_amount': value['Importe Cobrado'] ?? null,
    }

})


export const recRowsTransformer = (rows: Record<string, any>[]) => {
    return z.array(recDocumentValidator).parse(rows)
}

export const recHeaders: TableHeaders = [
    { key: 'g_c', label: 'G.C.', width: 50, },
    { key: 'name', label: 'Apellido y Nombre', width: 200, },
    { key: 'fiscal_id_type', label: 'Tipo ID Fiscal', width: 140, },
    { key: 'fiscal_id_number', label: 'Nro ID Fiscal', width: 140, },
    { key: 'du_type', label: 'Tipo DU', width: 140, },
    { key: 'du_number', label: 'Nro DU', width: 140, },
    { key: 'channel', label: 'Canal', width: 140, },
    { key: 'invoice_number', label: 'Nro Factura', width: 140, alwaysRequired: true },
    { key: 'period', label: 'Período', width: 140, },
    { key: 'first_due_amount', label: 'Importe 1er Vto.', width: 140, },
    { key: 'first_due_date', label: 'Fecha 1er Vto.', width: 140, },
    { key: 'second_due_amount', label: 'Importe 2do Vto.', width: 140, },
    { key: 'second_due_date', label: 'Fecha 2do. Vto.', width: 140, },
    { key: 'additional_info', label: 'Info. Adicional', width: 140, },
    { key: 'payment_channel', label: 'Canal de Cobro', width: 140, },
    { key: 'payment_date', label: 'Fecha de Pago/Débito', width: 140, },
    { key: 'collected_amount', label: 'Importe Cobrado', width: 140, },
]