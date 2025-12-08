import { Buffer } from 'buffer'

import {
  nanosecondsInSecond,
  thorchainBlockTimeSeconds,
} from '../../constants/time'

export const parseBigint = (value?: string | number | null) => {
  if (value === undefined || value === null) return 0n
  try {
    return BigInt(value)
  } catch {
    return 0n
  }
}

export const parseNumber = (value?: string | number | null) => {
  if (value === undefined || value === null) return 0
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

export const encodeBase64 = (value: string) => {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    return window.btoa(value)
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value).toString('base64')
  }
  return value
}

export const toBondStatusLabel = (status?: string) => {
  if (!status) return 'unknown'
  const normalized = status.toLowerCase()
  if (normalized === 'active') return 'active'
  if (normalized === 'ready') return 'ready'
  if (normalized === 'standby') return 'standby'
  if (normalized === 'disabled') return 'disabled'
  if (normalized === 'whitelisted') return 'whitelisted'
  return 'unknown'
}

export const estimateNextChurn = ({
  nextChurnHeight,
  currentHeight,
  referenceTimestamp,
  churns,
}: {
  nextChurnHeight?: number
  currentHeight: number
  referenceTimestamp: number
  churns: Array<{ height?: string; date?: string }>
}) => {
  if (!nextChurnHeight || nextChurnHeight <= currentHeight) return undefined
  const deriveAverageBlockTime = (
    entries: Array<{ height?: string; date?: string }>
  ) => {
    if (!entries || entries.length < 2) return thorchainBlockTimeSeconds

    const sorted = entries
      .map(churn => ({
        height: parseNumber(churn.height),
        date: parseNumber(churn.date) / nanosecondsInSecond,
      }))
      .filter(entry => entry.height && entry.date)
      .sort((a, b) => b.height - a.height)

    if (sorted.length < 2) return thorchainBlockTimeSeconds

    let totalSeconds = 0
    let totalBlocks = 0

    for (let i = 0; i < sorted.length - 1; i++) {
      const newer = sorted[i]
      const older = sorted[i + 1]
      const blockDiff = newer.height - older.height
      const timeDiff = newer.date - older.date
      if (blockDiff > 0 && timeDiff > 0) {
        totalBlocks += blockDiff
        totalSeconds += timeDiff
      }
    }

    return totalBlocks > 0 ? totalSeconds / totalBlocks : thorchainBlockTimeSeconds
  }

  const avgBlockTime = deriveAverageBlockTime(churns)
  const remainingBlocks = nextChurnHeight - currentHeight
  const etaSeconds = remainingBlocks * avgBlockTime
  return new Date((referenceTimestamp + etaSeconds) * 1000)
}
