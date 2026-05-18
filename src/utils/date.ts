export function formatDate(iso: string, locale = 'id-ID'): string {
  return new Date(iso).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatMonth(iso: string, locale = 'id-ID'): string {
  return new Date(iso).toLocaleDateString(locale, { month: 'long', year: 'numeric' })
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function monthStart(date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10)
}

export function monthEnd(date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10)
}
