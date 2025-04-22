import { UtxoChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

export const getUtxoFeeUnit = (chain: UtxoChain): string =>
  `${chainFeeCoin[chain].ticker}/vbyte`
