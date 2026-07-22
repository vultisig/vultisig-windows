import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import { FindSwapQuoteInput } from '@vultisig/core-chain/swap/quote/findSwapQuote'

import { ProductBrand } from '../../../product/brand'
import { stationSwapAffiliateConfig } from '../affiliate/stationSwapAffiliateConfig'
import { clientSwapQuoteProviderExclusions } from '../clientSwapQuoteConfig'

type BuildSwapQuoteInput = {
  from: AccountCoin
  to: AccountCoin
  amount: bigint
  referral?: string | null
  vultDiscountTier?: VultDiscountTier | null
  productBrand: ProductBrand
  slippageTolerance?: number
  recipient?: string
}

export const buildSwapQuoteInput = ({
  from,
  to,
  amount,
  referral,
  vultDiscountTier,
  productBrand,
  slippageTolerance,
  recipient,
}: BuildSwapQuoteInput): FindSwapQuoteInput => {
  const baseInput = {
    from,
    to,
    amount,
    referral: referral ?? undefined,
    slippageTolerance,
    recipient,
    excludeProviders: clientSwapQuoteProviderExclusions,
  }

  if (productBrand === 'station') {
    return {
      ...baseInput,
      vultDiscountTier: null,
      affiliateConfig: stationSwapAffiliateConfig,
    }
  }

  return {
    ...baseInput,
    vultDiscountTier,
  }
}
