import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

const minute = convertDuration(1, 'min', 'ms')
const hour = convertDuration(1, 'h', 'ms')
const day = convertDuration(1, 'd', 'ms')
const week = convertDuration(1, 'w', 'ms')

// Largest first: the coarsest unit that still has a whole value wins.
const relativeUnits: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', day * 365],
  ['month', day * 30],
  ['week', week],
  ['day', day],
  ['hour', hour],
  ['minute', minute],
]

type FormatLimitChartRelativeTimeInput = {
  timestamp: number
  now: number
  locale: string
}

/**
 * "1 minute ago", "3 days ago" — how long ago the pair last traded at the
 * target, in the coarsest unit that still counts. Always phrased in the past
 * and never below a minute: the instant comes from a resampled series, so
 * sub-minute precision would be invented.
 */
export const formatLimitChartRelativeTime = ({
  timestamp,
  now,
  locale,
}: FormatLimitChartRelativeTimeInput): string => {
  const elapsed = Math.max(0, now - timestamp)
  const [unit, unitMs] =
    relativeUnits.find(([, size]) => elapsed >= size) ??
    relativeUnits[relativeUnits.length - 1]

  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
    -Math.max(1, Math.round(elapsed / unitMs)),
    unit
  )
}
