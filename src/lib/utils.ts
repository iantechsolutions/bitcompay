import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function nameInitials(name: string) {
  const [firstName, lastName] = name.split(" ")
  return `${firstName?.[0] ?? ''}${lastName ? lastName[0] : ""}`
}