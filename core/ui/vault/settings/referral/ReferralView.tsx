import { ReferralsGuard } from './providers/ReferralsGuard'
import { ReferralPage } from './ReferralsPage'

/** The referrals page behind its access guard, as registered in the shared navigation. */
export const ReferralView = () => (
  <ReferralsGuard>
    <ReferralPage />
  </ReferralsGuard>
)
