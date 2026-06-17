import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'

import { getVultCooldownDuration } from '../core/getVultCooldownDuration'

export const vultCooldownQueryKey = ['vultCooldownDuration'] as const

/** Cooldown duration (seconds) — read live; changes rarely. */
export const useVultCooldownQuery = () =>
  useQuery({
    queryKey: vultCooldownQueryKey,
    queryFn: getVultCooldownDuration,
    ...noRefetchQueryOptions,
  })
