import { nativeSwapAffiliateConfig } from '@core/chain/swap/native/nativeSwapAffiliateConfig'

import { useAssertCurrentVaultId } from '../../../../storage/currentVaultId'
import { useFriendReferralQuery } from '../../../../storage/referrals'

export const useActiveReferral = () => {
  const vaultId = useAssertCurrentVaultId()
  const { data: savedReferralName = '' } = useFriendReferralQuery(vaultId)

  const hasReferral = !!savedReferralName

  const appAffiliateBps = hasReferral
    ? nativeSwapAffiliateConfig.referralDiscountAffiliateFeeRateBps
    : nativeSwapAffiliateConfig.affiliateFeeRateBps

  const referrerBps = hasReferral ? 10 : 0
  const combinedAffiliateBps = appAffiliateBps + referrerBps

  return {
    savedReferralName,
    hasReferral,
    appAffiliateBps,
    referrerBps,
    combinedAffiliateBps,
  }
}
