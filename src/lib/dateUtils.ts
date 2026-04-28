import { format, parseISO } from 'date-fns'

// Displays the stored ISO timestamp as-is, without browser timezone conversion.
// Uses UTC components to neutralize the local offset so format() shows the
// digits exactly as stored in the database.
export function formatStoredDate(iso: string, pattern: string): string {
  const d = parseISO(iso)
  const neutral = new Date(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
    d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()
  )
  return format(neutral, pattern)
}
