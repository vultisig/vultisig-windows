import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const {
  useState: usePendingReferral,
  provider: PendingReferralProvider,
} = getStateProviderSetup<string>('PendingReferral')
