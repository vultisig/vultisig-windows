import { EvmChain } from '@core/chain/Chain'
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
import { hasThorguardNft } from './thorguard'

type GetVultDiscountTierInput = {
  vultBalance: bigint
  hasThorguardNft: boolean
}

export const getVultDiscountTier = ({
  vultBalance,
  hasThorguardNft,
}: GetVultDiscountTierInput): VultDiscountTier | null => {
  const balance = fromChainAmount(vultBalance, vult.decimals)

  const baseTier = order(
    toEntries(vultDiscountTierMinBalances),
    ({ value }) => value,
    'desc'
  ).find(({ value }) => balance >= value)?.key

  if (!hasThorguardNft || !baseTier) {
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

export const getVultDiscountTierWithThorguard = async (
  chainBalance: bigint,
  options: {
    chain: EvmChain
    address: string
  }
): Promise<VultDiscountTier | undefined> => {
  const hasThorguard = await hasThorguardNft({
    chain: options.chain,
    address: options.address as `0x${string}`,
  })

  return getVultDiscountTier({
    vultBalance: chainBalance,
    hasThorguardNft: hasThorguard,
  })
}

export const getSwapAffiliateBpsFromTier = (
  tier: VultDiscountTier | undefined
): number => {
  if (!tier) {
    return baseAffiliateBps
  }

  if (tier === 'ultimate') {
    return 0
  }

  return baseAffiliateBps - vultDiscountTierBps[tier]
}

export const getSwapAffiliateBps = async (
  balance: bigint,
  options?: {
    chain?: EvmChain
    address?: string
  }
): Promise<number> => {
  const discountTier =
    options?.chain && options?.address
      ? await getVultDiscountTierWithThorguard(balance, {
          chain: options.chain,
          address: options.address,
        })
      : getVultDiscountTier({
          vultBalance: balance,
          hasThorguardNft: false,
        })

  return getSwapAffiliateBpsFromTier(discountTier)
}
