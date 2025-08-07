import { BlockaidSupportedChain } from '../../chains'
import { BlockaidTxScanResult } from './core'

export type BlockaidTxScanInput = {
  chain: BlockaidSupportedChain
  data: Record<string, unknown>
}

export type BlockaidTxScanResolver<
  T extends BlockaidSupportedChain = BlockaidSupportedChain,
> = (input: BlockaidTxScanInput & { chain: T }) => Promise<BlockaidTxScanResult>
