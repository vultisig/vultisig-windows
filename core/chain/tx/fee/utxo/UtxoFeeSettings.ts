import { FeePriority } from '../../fee/FeePriority'

export type UtxoFeeSettings = {
  priority: FeePriority | number
}

export const byteFeeMultiplier: Record<FeePriority, number> = {
  low: 0.75,
  normal: 1,
  fast: 2.5,
}
