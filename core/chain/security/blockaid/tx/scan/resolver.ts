import { BlockaidSupportedChain } from '../../chains'
import { BlockaidTxScanResult } from './core'

export type BlockaidTxScanInput<
  T extends BlockaidSupportedChain = BlockaidSupportedChain,
> = {
  chain: T
  data: Record<string, unknown>
}

export type BlockaidTxScanResolver<
  T extends BlockaidSupportedChain = BlockaidSupportedChain,
> = (input: BlockaidTxScanInput<T>) => Promise<BlockaidTxScanResult>
