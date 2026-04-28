import { format, parseISO } from 'date-fns'

// The public site stores appointment times via <input type="datetime-local">,
// which captures the user's local BRT time but sends it to Supabase without a
// timezone offset. Supabase (UTC session) stores "10:40 BRT" as "10:40 UTC".
// Displaying with date-fns format() in a BRT browser would subtract 3h → "07:40".
// Fix: read the UTC components and build a timezone-neutral Date so format()
// shows the stored digits as-is, matching what the user typed.
export function formatStoredDate(iso: string, pattern: string): string {
  const d = parseISO(iso)
  const neutral = new Date(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
    d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()
  )
  return format(neutral, pattern)
}
