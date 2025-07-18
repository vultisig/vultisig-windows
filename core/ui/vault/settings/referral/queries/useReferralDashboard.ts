import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'

import { getReferralDashboard } from '../services/getReferralDashboard'

export const useReferralDashboard = (address: string) =>
  useQuery({
    queryKey: ['referral-dashboard', address],
    queryFn: () => getReferralDashboard(address),
    ...noRefetchQueryOptions,
  })
