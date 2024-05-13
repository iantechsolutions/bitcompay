import { z } from "zod";
import { stringAsDate } from "./providers-schema";

export const PlanSchema = z.object({
  expiration_date: stringAsDate,
  plan_code: z
    .string()
    .max(255, { message: "ingrese un código de plan válido" }),
  description: z
    .string()
    .max(255, { message: "ingrese una descripción válida" }),
  age: z
    .string()
    .refine(
      (value) =>
        !isNaN(Number(value)) && Number(value) > 0 && Number(value) < 120,
      {
        message: "ingrese una edad válida",
      },
    )
    .transform((value) => Number(value))
    .or(z.number()),
  price: z
    .string()
    .refine((value) => !isNaN(Number(value)), {
      message: "ingrese un precio válido",
    })
    .refine((value) => Number(value) > 0, {
      message: "ingrese un precio mayor a 0",
    })
    .transform((value) => Number(value))
    .or(z.number()),
});
