import { FeePriority } from '../FeePriority'

export type EvmFeeSettings = {
  priority: FeePriority
  gasLimit: number
}
