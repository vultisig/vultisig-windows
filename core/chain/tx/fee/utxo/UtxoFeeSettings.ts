import { FeePriority } from '../../fee/FeePriority'

export type UtxoFeeSettings = { priority: FeePriority } | { byteFee: bigint }

export const complexUtxoTxMultiplier = 2.5

export const byteFeeMultiplier: Record<FeePriority, number> = {
  low: 0.75,
  normal: 1,
  fast: complexUtxoTxMultiplier,
}
