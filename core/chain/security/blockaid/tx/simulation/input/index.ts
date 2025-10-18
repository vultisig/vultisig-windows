import { getChainKind } from '@core/chain/ChainKind'
import {
  BlockaidSupportedChainKind,
  blockaidSupportedChains,
} from '@core/chain/security/blockaid/chains'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { BlockaidTxSimulationInput } from '../resolver'
import {
  BlockaidTxSimulationInputResolver,
  BlockaidTxSimulationInputResolverInput,
} from './resolver'
import { getSolanaBlockaidTxSimulationInput } from './resolvers/solana'

const resolvers: Record<
  BlockaidSupportedChainKind,
  BlockaidTxSimulationInputResolver<any>
> = {
  solana: getSolanaBlockaidTxSimulationInput,
  evm: () => {
    throw new Error('EVM simulation not supported')
  },
  utxo: () => {
    throw new Error('Utxo simulation not supported')
  },
  sui: () => {
    throw new Error('Sui simulation not supported')
  },
}

export const getBlockaidTxSimulationInput = (
  input: Omit<BlockaidTxSimulationInputResolverInput, 'chain'>
): BlockaidTxSimulationInput | null => {
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
