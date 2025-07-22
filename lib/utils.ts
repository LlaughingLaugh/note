import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { format, parseISO } from 'date-fns';

export function formatDateTimeLocal(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString.replace(" ", "T") + "Z");
    return format(date, "d MMM yyyy, h:mm a");
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid date"; // Fallback for invalid date strings
  }
}
