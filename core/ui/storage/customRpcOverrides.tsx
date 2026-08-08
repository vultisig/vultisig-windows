import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { shouldBeDefined } from '@vultisig/lib-utils/assert/shouldBeDefined'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

/** App-wide, per-chain custom RPC endpoint overrides, keyed by chain. */
export type CustomRpcOverrides = Partial<Record<Chain, string>>

type GetCustomRpcOverridesFunction = () => Promise<CustomRpcOverrides>

type SetCustomRpcOverridesFunction = (
  overrides: CustomRpcOverrides
) => Promise<void>

export type CustomRpcOverridesStorage = {
  getCustomRpcOverrides: GetCustomRpcOverridesFunction
  setCustomRpcOverrides: SetCustomRpcOverridesFunction
}

export const useCustomRpcOverridesQuery = () => {
  const { getCustomRpcOverrides } = useCore()

  return useQuery({
    queryKey: [StorageKey.customRpcOverrides],
    queryFn: getCustomRpcOverrides,
    ...noRefetchQueryOptions,
  })
}

/** Current overrides map. Empty object when none are set. */
export const useCustomRpcOverrides = (): CustomRpcOverrides => {
  const { data } = useCustomRpcOverridesQuery()

  return shouldBeDefined(data)
}

type SetCustomRpcOverrideInput = {
  chain: Chain
  url: string
}

export const useSetCustomRpcOverrideMutation = () => {
  const { getCustomRpcOverrides, setCustomRpcOverrides } = useCore()
  const refetchQueries = useRefetchQueries()

  return useMutation({
    mutationFn: async ({ chain, url }: SetCustomRpcOverrideInput) => {
      const current = await getCustomRpcOverrides()
      await setCustomRpcOverrides({ ...current, [chain]: url })
      await refetchQueries([StorageKey.customRpcOverrides])
    },
  })
}

export const useClearCustomRpcOverrideMutation = () => {
  const { getCustomRpcOverrides, setCustomRpcOverrides } = useCore()
  const refetchQueries = useRefetchQueries()

  return useMutation({
    mutationFn: async (chain: Chain) => {
      const rest = { ...(await getCustomRpcOverrides()) }
      delete rest[chain]
      await setCustomRpcOverrides(rest)
      await refetchQueries([StorageKey.customRpcOverrides])
    },
  })
}
