import { getChainKind } from '@core/chain/ChainKind'
import {
  BlockaidSupportedChainKind,
  blockaidSupportedChains,
} from '@core/chain/security/blockaid/chains'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { BlockaidTxScanInput } from '../resolver'
import {
  BlockaidTxScanInputResolver,
  BlockaidTxScanInputResolverInput,
} from './resolver'
import { getEvmBlockaidTxScanInput } from './resolvers/evm'
import { getSolanaBlockaidTxScanInput } from './resolvers/solana'

const resolvers: Record<
  BlockaidSupportedChainKind,
  BlockaidTxScanInputResolver<any>
> = {
  evm: getEvmBlockaidTxScanInput,
  solana: getSolanaBlockaidTxScanInput,
}

export const getBlockaidTxScanInput = (
  input: Omit<BlockaidTxScanInputResolverInput, 'chain'>
): BlockaidTxScanInput | null => {
  const chain = getKeysignChain(input.payload)
  if (!isOneOf(chain, blockaidSupportedChains)) {
    return null
  }

  const chainKind = getChainKind(chain)

  const data = resolvers[chainKind]({
    ...input,
    chain,
  })

  if (!data) {
    return null
  }

  return { chain, data }
}
