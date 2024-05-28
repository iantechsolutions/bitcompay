import { z } from 'zod'
import { stringAsDate } from './providers-schema'

export const PlanSchema = z.object({
  user: z.string().max(255),
  createdAt:stringAsDate,
  expiration_date: stringAsDate,
  plan_code: z
    .string()
    .max(255, { message: "ingrese un código de plan válido" }),
  description: z
    .string()
    .max(255, { message: "ingrese una descripción válida" }),
  business_units_id:z.string().max(255),
});
