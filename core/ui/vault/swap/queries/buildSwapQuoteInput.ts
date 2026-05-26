import { ProductBrand } from '@core/ui/product/brand'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import { FindSwapQuoteInput } from '@vultisig/core-chain/swap/quote/findSwapQuote'

import { stationSwapAffiliateConfig } from '../affiliate/stationSwapAffiliateConfig'

type BuildSwapQuoteInput = {
  from: AccountCoin
  to: AccountCoin
  amount: bigint
  referral?: string | null
  vultDiscountTier?: VultDiscountTier | null
  productBrand: ProductBrand
}

export const buildSwapQuoteInput = ({
  from,
  to,
  amount,
  referral,
  vultDiscountTier,
  productBrand,
}: BuildSwapQuoteInput): FindSwapQuoteInput => {
  const baseInput = {
    from,
    to,
    amount,
    referral: referral ?? undefined,
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
