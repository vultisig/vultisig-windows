import { useReferralPayoutAsset } from '../providers/ReferralPayoutAssetProvider'

export const useReferralSender = () => {
  const [{ address }] = useReferralPayoutAsset()

  return address
}
