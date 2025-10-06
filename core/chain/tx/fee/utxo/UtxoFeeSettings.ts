import { FeePriority } from '../../fee/FeePriority'

export type UtxoFeeSettings = {
  priority: FeePriority | number
}

export const byteFeeMultiplier: Record<FeePriority, number> = {
  low: 3,
  normal: 5,
  fast: 12,
}
