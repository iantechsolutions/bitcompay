import { z } from "zod";
import { stringAsDate } from "./providers-schema";

export const PlanSchema = z.object({
  id: z.string().max(255).optional(),
  user: z.string().max(255).optional(),
  // createdAt: stringAsDate,
  plan_code: z
    .string()
    .max(255, { message: "ingrese un código de plan válido" }),
  description: z
    .string()
    .max(255, { message: "ingrese una descripción válida" }),
  brand_id: z.string().max(255),
});
