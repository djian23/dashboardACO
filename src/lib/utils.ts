import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"
import { fr, enUS } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date, lang = "fr"): string {
  const d = typeof date === "string" ? new Date(date) : date
  const locale = lang === "fr" ? fr : enUS
  return format(d, "dd MMM yyyy", { locale })
}

export function formatDateTime(date: string | Date, lang = "fr"): string {
  const d = typeof date === "string" ? new Date(date) : date
  const locale = lang === "fr" ? fr : enUS
  return format(d, "dd MMM yyyy HH:mm", { locale })
}

export function formatRelativeTime(date: string | Date, lang = "fr"): string {
  const d = typeof date === "string" ? new Date(date) : date
  const locale = lang === "fr" ? fr : enUS
  return formatDistanceToNow(d, { addSuffix: true, locale })
}

export function calculateROI(invested: number, revenue: number): number {
  if (invested === 0) return 0
  return ((revenue - invested) / invested) * 100
}
