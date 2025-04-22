import { Chain, EvmChain, UtxoChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { gwei } from '@core/chain/tx/fee/evm/gwei'
import { isOneOf } from '@lib/utils/array/isOneOf'

import { getUtxoFeeUnit } from '../utxo/getUtxoFeeUnit'

export const getFeeUnit = (chain: Chain): string => {
  if (isOneOf(chain, Object.values(EvmChain))) {
    return gwei.name
  }

  if (isOneOf(chain, Object.values(UtxoChain))) {
    return getUtxoFeeUnit(chain as UtxoChain)
  }

  return chainFeeCoin[chain].ticker
}
