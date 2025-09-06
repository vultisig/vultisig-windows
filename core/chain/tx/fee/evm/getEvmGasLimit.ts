import { EvmChain } from '@core/chain/Chain'

import { CoinKey } from '../../../coin/Coin'
import { evmNativeTokenGasLimit, evmTokenGasLimit } from './evmGasLimit'

export const getEvmGasLimit = ({ chain, id }: CoinKey<EvmChain>) => {
  const record = id ? evmTokenGasLimit : evmNativeTokenGasLimit
  return record[chain]
}
