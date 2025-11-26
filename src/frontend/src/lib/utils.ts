import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-US', options).format(value)
}

export function formatCurrency(value: number): string {
  return formatNumber(value, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function formatPercent(value: number): string {
  return formatNumber(value / 100, { style: 'percent', maximumFractionDigits: 1 })
}

export function getRiskColor(score: number): string {
  if (score >= 80) return 'risk-critical'
  if (score >= 60) return 'risk-high'
  if (score >= 40) return 'risk-medium'
  return 'risk-low'
}

export function getRiskLabel(score: number): string {
  if (score >= 80) return 'Critical'
  if (score >= 60) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}
