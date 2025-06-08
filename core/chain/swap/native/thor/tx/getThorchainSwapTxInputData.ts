import { fromCommCoin } from '@core/mpc/types/utils/commCoin'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { getChainKind } from '../../../../ChainKind'
import {
  ThorChainSwapEnabledChainKind,
  thorChainSwapEnabledChains,
} from '../../NativeSwapChain'
import { getCosmosThorchainSwapTxInputData } from './cosmos'
import { getEvmThorchainSwapTxInputData } from './evm'
import {
  GetThorchainSwapTxInputDataInput,
  ThorchainSwapTxInputDataResolver,
} from './ThorchainSwapTxInputDataResolver'
import { getUtxoThorchainSwapTxInputData } from './utxo'

type Input = Omit<GetThorchainSwapTxInputDataInput<never>, 'chain'>

const resolvers: Record<
  ThorChainSwapEnabledChainKind,
  ThorchainSwapTxInputDataResolver<any>
> = {
  utxo: getUtxoThorchainSwapTxInputData,
  cosmos: getCosmosThorchainSwapTxInputData,
  evm: getEvmThorchainSwapTxInputData,
}

export const getThorchainSwapTxInputData = async (
  input: Input
): Promise<Uint8Array> => {
  const { chain } = fromCommCoin(shouldBePresent(input.swapPayload.fromCoin))

  if (!isOneOf(chain, thorChainSwapEnabledChains)) {
    throw new Error(`Chain ${chain} is not supported for Thorchain swap`)
  }

  const chainKind = getChainKind(chain)

  const resolver = resolvers[chainKind]

  return resolver({ ...input, chain })
}
