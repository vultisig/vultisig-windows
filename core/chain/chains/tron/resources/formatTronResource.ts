const msPerMinute = 60_000
const msPerHour = 3_600_000
const msPerDay = 86_400_000

type FormatTronResourceValueInput = {
  available: number
  total: number
  unit: string
}

export const formatTronResourceValue = ({
  available,
  total,
  unit,
}: FormatTronResourceValueInput): string => {
  if (total >= 1000 && unit) {
    const availableK = (available / 1000).toFixed(2)
    const totalK = (total / 1000).toFixed(2)
    return `${availableK}/${totalK}${unit}`
  }

  if (total >= 1000) {
    const availableK = (available / 1000).toFixed(2)
    const totalK = (total / 1000).toFixed(2)
    return `${availableK}K/${totalK}K`
  }

  return `${available}/${total}`
}

export const formatTronWithdrawalTime = (expireTimeMs: number): string => {
  const remaining = expireTimeMs - Date.now()

  if (remaining <= 0) {
    return 'ready_to_claim'
  }

  const days = Math.floor(remaining / msPerDay)
  const hours = Math.floor((remaining % msPerDay) / msPerHour)

  if (days > 0) {
    return `${days}d ${hours}h`
  }

  const minutes = Math.floor((remaining % msPerHour) / msPerMinute)
  return `${hours}h ${minutes}m`
}

export const sunToTrx = (sun: bigint): number => Number(sun) / 1_000_000

export const trxToSun = (trx: number): bigint =>
  BigInt(Math.round(trx * 1_000_000))
