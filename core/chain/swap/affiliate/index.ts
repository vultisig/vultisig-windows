import { vult } from '@core/chain/coin/knownTokens'
import { order } from '@lib/utils/array/order'
import { toEntries } from '@lib/utils/record/toEntries'

import { fromChainAmount } from '../../amount/fromChainAmount'
import {
  baseAffiliateBps,
  VultDiscountTier,
  vultDiscountTierBps,
  vultDiscountTierMinBalances,
  vultDiscountTiers,
} from './config'

type GetVultDiscountTierInput = {
  vultBalance: bigint
  thorguardNftBalance: bigint
}

export const getVultDiscountTier = ({
  vultBalance,
  thorguardNftBalance,
}: GetVultDiscountTierInput): VultDiscountTier | null => {
  const balance = fromChainAmount(vultBalance, vult.decimals)

  const baseTier = order(
    toEntries(vultDiscountTierMinBalances),
    ({ value }) => value,
    'desc'
  ).find(({ value }) => balance >= value)?.key

  if (thorguardNftBalance === 0n || !baseTier) {
    return null
  }

  const currentTierIndex = vultDiscountTiers.indexOf(baseTier)
  const platinumIndex = vultDiscountTiers.indexOf('platinum')

  if (currentTierIndex >= platinumIndex) {
    return baseTier
  }

  const nextTierIndex = currentTierIndex + 1
  return vultDiscountTiers[nextTierIndex]
}

export const getSwapAffiliateBps = (
  discountTier: VultDiscountTier | null
): number => {
  return discountTier
    ? baseAffiliateBps - vultDiscountTierBps[discountTier]
    : baseAffiliateBps
}
