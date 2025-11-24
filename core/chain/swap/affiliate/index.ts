import { vult } from '@core/chain/coin/knownTokens'
import { getLastItem } from '@lib/utils/array/getLastItem'
import { order } from '@lib/utils/array/order'
import { toEntries } from '@lib/utils/record/toEntries'

import { fromChainAmount } from '../../amount/fromChainAmount'
import {
  baseAffiliateBps,
  VultDiscountTier,
  vultDiscountTierBps,
  vultDiscountTierMinBalances,
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

  const descendingTiers = order(
    toEntries(vultDiscountTierMinBalances),
    ({ value }) => value,
    'desc'
  )

  const baseTier = descendingTiers.find(({ value }) => balance >= value)?.key

  if (thorguardNftBalance === 0n) {
    return baseTier ?? null
  }

  if (!baseTier) {
    return getLastItem(descendingTiers).key
  }

  const currentTierIndex = descendingTiers.findIndex(
    ({ key }) => key === baseTier
  )
  const platinumIndex = descendingTiers.findIndex(
    ({ key }) => key === 'platinum'
  )

  if (currentTierIndex > platinumIndex) {
    return baseTier
  }

  return descendingTiers[currentTierIndex - 1].key
}

export const getSwapAffiliateBps = (
  discountTier: VultDiscountTier | null
): number => {
  return discountTier
    ? baseAffiliateBps - vultDiscountTierBps[discountTier]
    : baseAffiliateBps
}
