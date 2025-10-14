import { vult } from '@core/chain/coin/knownTokens'
import { order } from '@lib/utils/array/order'
import { toEntries } from '@lib/utils/record/toEntries'

import { fromChainAmount } from '../../amount/fromChainAmount'
import {
  baseAffiliateBps,
  vultDiscountTierDiscounts,
  vultDiscountTierMinBalances,
} from './config'

export const getSwapAffiliateBps = (chainBalance: bigint): number => {
  const balance = fromChainAmount(chainBalance, vult.decimals)

  const discountTier = order(
    toEntries(vultDiscountTierMinBalances),
    ({ value }) => value,
    'desc'
  ).find(({ value }) => balance >= value)

  return discountTier
    ? baseAffiliateBps - vultDiscountTierDiscounts[discountTier.key]
    : baseAffiliateBps
}
