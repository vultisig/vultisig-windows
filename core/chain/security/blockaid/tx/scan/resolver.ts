import { BlockaidSupportedChains } from '../../chains'
import { BlockaidTxScanResult } from './core'

export type BlockaidTxScanInput = {
  chain: BlockaidSupportedChains
  data: unknown
}

export type BlockaidTxScanResolver<
  T extends BlockaidSupportedChains = BlockaidSupportedChains,
> = (input: BlockaidTxScanInput & { chain: T }) => Promise<BlockaidTxScanResult>
