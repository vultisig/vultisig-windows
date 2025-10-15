import { vult } from '@core/chain/coin/knownTokens'
import { order } from '@lib/utils/array/order'
import { toEntries } from '@lib/utils/record/toEntries'

import { fromChainAmount } from '../../amount/fromChainAmount'
import {
  baseAffiliateBps,
  VultDiscountTier,
  vultDiscountTierBps,
  vultDiscountTierMinBalances,
} from './config'

export const getVultDiscountTier = (
  chainBalance: bigint
): VultDiscountTier | undefined => {
  const balance = fromChainAmount(chainBalance, vult.decimals)

  return order(
    toEntries(vultDiscountTierMinBalances),
    ({ value }) => value,
    'desc'
  ).find(({ value }) => balance >= value)?.key
}

export const getSwapAffiliateBps = (balance: bigint): number => {
  const discountTier = getVultDiscountTier(balance)

  return discountTier
    ? baseAffiliateBps - vultDiscountTierBps[discountTier]
    : baseAffiliateBps
}
