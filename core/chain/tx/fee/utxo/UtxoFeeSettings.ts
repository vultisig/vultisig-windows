import { FeePriority } from '../../fee/FeePriority'

export type UtxoFeeSettings = {
  priority: FeePriority | number
}

export const byteFeeMultiplier: Record<FeePriority, number> = {
  low: 1.875,
  normal: 2.5,
  fast: 6.25,
}
