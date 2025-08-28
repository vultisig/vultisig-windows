import { nativeSwapAffiliateConfig } from '@core/chain/swap/native/nativeSwapAffiliateConfig'

import { useAssertCurrentVaultId } from '../../../../storage/currentVaultId'
import { useFriendReferralQuery } from '../../../../storage/referrals'

export const useActiveReferral = () => {
  const vaultId = useAssertCurrentVaultId()
  const { data: potentialFriendReferral = '' } = useFriendReferralQuery(vaultId)

  const storedFriendReferral = potentialFriendReferral ?? ''

  // Spec: with referral → vi=35bp + referral=10bp (total 45).
  // Without → vi=50bp.
  const viBp = storedFriendReferral
    ? nativeSwapAffiliateConfig.referralDiscountAffiliateFeeRateBps
    : nativeSwapAffiliateConfig.affiliateFeeRateBps

  const referralBp = storedFriendReferral ? 10 : 0
  const totalBp = viBp + referralBp

  return {
    referralName: storedFriendReferral,
    viBp,
    referralBp,
    totalBp,
  }
}
