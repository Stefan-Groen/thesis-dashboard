/**
 * Format date consistently for server and client rendering
 * Avoids hydration mismatches by using a consistent format
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'

  const d = typeof date === 'string' ? new Date(date) : date

  // Use ISO date format and format manually to avoid locale differences
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
