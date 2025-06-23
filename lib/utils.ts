import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { format, parseISO } from 'date-fns';

export function formatDateTimeLocal(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = parseISO(dateString); // Parses the UTC string
    // Format examples:
    // "1 Jun 2025 6PM" -> format(date, "d MMM yyyy hbbb")
    // The 'bbb' format token is for AM/PM in lowercase, date-fns uses 'h B' or 'h bbb' for uppercase AM/PM
    // Let's adjust to use a format that results in uppercase AM/PM as per "6PM" example.
    // 'p' gives localized time, 'PPpp' gives localized date and time with seconds.
    // For "1 Jun 2025 6PM", the format string is "d MMM yyyy haaa" or "d MMM yyyy h a"
    // Let's use "d MMM yyyy h a" which should produce "1 Jun 2025 6 am/pm".
    // For "6PM" specifically, it should be "d MMM yyyy h'B'" if date-fns supported 'B' directly for uppercase AM/PM.
    // A common way is to use 'h a' and then replace 'am'/'pm'.
    // However, `date-fns` `format` function handles localization well.
    // The format 'd MMM yyyy h a' will output e.g. "1 Jun 2025 6 AM" or "1 Jun 2025 6 PM".
    // The example "6PM" implies no space before AM/PM.
    // Let's try "d MMM yyyy haaa" which is a standard token for time with AM/PM.
    return format(date, "d MMM yyyy haaa");
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return "Invalid date"; // Fallback for invalid date strings
  }
}
