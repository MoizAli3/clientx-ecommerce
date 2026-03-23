import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format number as PKR currency */
export function formatPKR(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Generate a unique order number */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${year}-${random}`;
}

/** Generate a unique transaction reference */
export function generateTxnRef(prefix = "T"): string {
  const ts = Date.now().toString();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${ts}${rand}`;
}

/** Format date for JazzCash (YYYYMMDDHHmmss) */
export function formatJazzCashDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

/** Add minutes to a date and return JazzCash-formatted string */
export function jazzCashExpiry(minutes = 30): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return formatJazzCashDate(d);
}

/** Convert PKR to paisa (JazzCash uses paisa) */
export function toPaisa(pkr: number): string {
  return String(Math.round(pkr * 100)).padStart(10, "0");
}
