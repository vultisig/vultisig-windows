import { useReferralPayoutAsset } from '../provders/ReferralPayoutAssetProvider'

export const useReferralSender = () => {
  const [{ address }] = useReferralPayoutAsset()

  return address
}
