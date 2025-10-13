import { vult } from '@core/chain/coin/knownTokens'

import { fromChainAmount } from '../../amount/fromChainAmount'
import { baseAffiliateBps, vultBasedSwapAffiliateBpsDiscounts } from './config'

export const getSwapAffiliateBps = (chainBalance: bigint): number => {
  const balance = fromChainAmount(chainBalance, vult.decimals)

  const discount = vultBasedSwapAffiliateBpsDiscounts.find(
    ([amount]) => balance > amount
  )

  return discount ? baseAffiliateBps - discount[1] : baseAffiliateBps
}
