import { Chain } from '../../../Chain'
import { baseAffiliateBps } from '../../affiliate/config'
import { nativeSwapAffiliateConfig } from '../nativeSwapAffiliateConfig'
import { NativeSwapChain } from '../NativeSwapChain'

type BuildAffiliateParamsInput = {
  swapChain: NativeSwapChain
  referral?: string
  affiliateBps: number
}

type AffiliateParams = {
  affiliate: string
  affiliate_bps: string
}

export const buildAffiliateParams = ({
  swapChain,
  referral,
  affiliateBps,
}: BuildAffiliateParamsInput): AffiliateParams => {
  const affiliateParams: Array<{ affiliate: string; bps: number }> = []

  if (swapChain === Chain.THORChain && referral) {
    affiliateParams.push({
      affiliate: referral,
      bps: nativeSwapAffiliateConfig.referrerFeeRateBps,
    })
    affiliateParams.push({
      affiliate: nativeSwapAffiliateConfig.affiliateFeeAddress,
      bps: Math.max(
        0,
        affiliateBps -
          (baseAffiliateBps -
            nativeSwapAffiliateConfig.referralDiscountAffiliateFeeRateBps)
      ),
    })
  } else {
    affiliateParams.push({
      affiliate: nativeSwapAffiliateConfig.affiliateFeeAddress,
      bps: affiliateBps,
    })
  }

  return {
    affiliate: affiliateParams.map(param => param.affiliate).join('/'),
    affiliate_bps: affiliateParams.map(param => param.bps).join('/'),
  }
}
