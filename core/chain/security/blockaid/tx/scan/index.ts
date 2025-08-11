import { DeriveChainKind, getChainKind } from '@core/chain/ChainKind'

import { BlockaidSupportedChain } from '../../chains'
import { BlockaidTxScanResult } from './core'
import { BlockaidTxScanInput, BlockaidTxScanResolver } from './resolver'
import { scanEvmTxWithBlockaid } from './resolvers/evm'
import { scanSolanaTxWithBlockaid } from './resolvers/solana'
import { scanSuiTxWithBlockaid } from './resolvers/sui'

const resolvers: Record<
  DeriveChainKind<BlockaidSupportedChain>,
  BlockaidTxScanResolver<any>
> = {
  evm: scanEvmTxWithBlockaid,
  solana: scanSolanaTxWithBlockaid,
  sui: scanSuiTxWithBlockaid,
}

export const scanTxWithBlockaid = async (
  input: BlockaidTxScanInput
): Promise<BlockaidTxScanResult> => {
  const chainKind = getChainKind(input.chain)

  return resolvers[chainKind](input)
}
