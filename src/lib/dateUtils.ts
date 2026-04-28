import { format, parseISO } from 'date-fns'

// The public site stores appointment times 3h behind the intended BRT time
// (UTC-3 offset not applied when saving). Adding 3h before display corrects it.
// Uses UTC components after correction to avoid a second browser-TZ shift.
export function formatStoredDate(iso: string, pattern: string): string {
  const d = parseISO(iso)
  const corrected = new Date(d.getTime() + 3 * 60 * 60 * 1000)
  const neutral = new Date(
    corrected.getUTCFullYear(), corrected.getUTCMonth(), corrected.getUTCDate(),
    corrected.getUTCHours(), corrected.getUTCMinutes(), corrected.getUTCSeconds()
  )
  return format(neutral, pattern)
}
