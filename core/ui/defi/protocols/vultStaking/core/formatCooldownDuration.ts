const secondsPerDay = 86400n
const secondsPerHour = 3600n

/**
 * Human-readable cooldown length (e.g. "2 days", "12 hours") from the on-chain
 * `cooldownDuration()` value in seconds. Rounds to the coarsest sensible unit.
 */
export const formatCooldownDuration = (seconds: bigint): string => {
  if (seconds >= secondsPerDay) {
    const days = Number(seconds / secondsPerDay)
    return `${days} ${days === 1 ? 'day' : 'days'}`
  }

  if (seconds >= secondsPerHour) {
    const hours = Number(seconds / secondsPerHour)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  }

  const minutes = Math.max(1, Number(seconds / 60n))
  return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`
}
