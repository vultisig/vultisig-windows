import { BlockaidSupportedChains } from '../../chains'
import { BlockaidTxScanResult } from './core'

export type BlockaidTxScanInput = {
  chain: BlockaidSupportedChains
  data: Record<string, unknown>
}

export type BlockaidTxScanResolver<
  T extends BlockaidSupportedChains = BlockaidSupportedChains,
> = (input: BlockaidTxScanInput & { chain: T }) => Promise<BlockaidTxScanResult>
