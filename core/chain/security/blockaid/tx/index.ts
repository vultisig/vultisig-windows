import { DeriveChainKind, getChainKind } from '@core/chain/ChainKind'

import { BlockaidSupportedChain } from '../chains'
import { BlockaidValidation } from './api/core'
import {
  BlockaidTxValidationInput,
  BlockaidTxValidationResolver,
} from './resolver'
import { getEvmTxBlockaidValidation } from './resolvers/evm'
import { getSolanaTxBlockaidValidation } from './resolvers/solana'
import { getSuiTxBlockaidValidation } from './resolvers/sui'
import { getUtxoTxBlockaidValidation } from './resolvers/utxo'

const resolvers: Record<
  DeriveChainKind<BlockaidSupportedChain>,
  BlockaidTxValidationResolver<any>
> = {
  evm: getEvmTxBlockaidValidation,
  utxo: getUtxoTxBlockaidValidation,
  solana: getSolanaTxBlockaidValidation,
  sui: getSuiTxBlockaidValidation,
}

export const getTxBlockaidValidation = async (
  input: BlockaidTxValidationInput
): Promise<BlockaidValidation> => {
  const chainKind = getChainKind(input.chain)

  return resolvers[chainKind](input)
}
