import { FeePriority } from '../../fee/FeePriority'

export type UtxoFeeSettings = { priority: FeePriority } | { byteFee: bigint }

export const byteFeeMultiplier: Record<FeePriority, number> = {
  low: 0.75,
  normal: 1,
  fast: 2.5,
}
