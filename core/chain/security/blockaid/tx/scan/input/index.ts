import { DeriveChainKind, getChainKind } from '@core/chain/ChainKind'
import {
  BlockaidSupportedChains,
  blockaidSupportedChains,
} from '@core/chain/security/blockaid/chains'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { BlockaidTxScanInput } from '../resolver'
import {
  BlockaidTxScanInputOptions,
  BlockaidTxScanInputResolver,
} from './resolver'
import { getEvmBlockaidTxScanInput } from './resolvers/evm'
import { getSolanaBlockaidTxScanInput } from './resolvers/solana'

const resolvers: Record<
  DeriveChainKind<BlockaidSupportedChains>,
  BlockaidTxScanInputResolver
> = {
  evm: getEvmBlockaidTxScanInput,
  solana: getSolanaBlockaidTxScanInput,
}

export const getBlockaidTxScanInput = (
  input: BlockaidTxScanInputOptions
): BlockaidTxScanInput | null => {
  const chain = getKeysignChain(input.payload)
  if (!isOneOf(chain, blockaidSupportedChains)) {
    return null
  }

  const chainKind = getChainKind(chain)

  const txScanInput = resolvers[chainKind](input)

  if (!txScanInput) {
    return null
  }

  return { chain, ...txScanInput }
}
