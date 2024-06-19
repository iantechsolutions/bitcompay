import { type ClassValue, clsx } from "clsx";
import { fi } from "date-fns/locale";
import { nanoid } from "nanoid";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function nameInitials(name: string) {
  const [firstName, lastName] = name.split(" ");
  return `${firstName?.[0] ?? ""}${lastName ? lastName[0] : ""}`;
}

export function createId() {
  return nanoid();
}

export function formatKB(bytes: number) {
  return `${(bytes / 1000).toFixed(1)} KB`;
}

export function computeIva(field: number, iva: number): number {
  return parseFloat(((field * iva) / (100 + iva)).toFixed(2));
}

export function computeBase(field: number, iva: number): number {
  return parseFloat((field - computeIva(field, iva)).toFixed(2));
}

export function computeTotal(field: number, iva: number): number {
  return parseFloat(((field * (100 + iva)) / 100).toFixed(2));
}

export function calcularEdad(fechaNacimiento: Date): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mes = hoy.getMonth() - fechaNacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
    edad--;
  }

  return edad;
}

export const topRightAbsoluteOnDesktopClassName =
  "md:absolute md:top-0 md:right-0 mr-10 mt-10";
