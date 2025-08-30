import { nativeSwapAffiliateConfig } from '@core/chain/swap/native/nativeSwapAffiliateConfig'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'

import { useAssertCurrentVaultId } from '../../../../storage/currentVaultId'
import { useFriendReferralQuery } from '../../../../storage/referrals'

export const useActiveReferralQuery = () => {
  const vaultId = useAssertCurrentVaultId()
  const referralQuery = useFriendReferralQuery(vaultId)

  return useTransformQueryData(referralQuery, rawName => {
    const savedReferralName = rawName ?? ''
    const hasReferral = savedReferralName !== ''

    const appAffiliateBps = hasReferral
      ? nativeSwapAffiliateConfig.referralDiscountAffiliateFeeRateBps
      : nativeSwapAffiliateConfig.affiliateFeeRateBps

    const referrerBps = hasReferral
      ? nativeSwapAffiliateConfig.referrerFeeRateBps
      : 0
    const combinedAffiliateBps = appAffiliateBps + referrerBps

    return {
      savedReferralName,
      hasReferral,
      appAffiliateBps,
      referrerBps,
      combinedAffiliateBps,
    }
  })
}
