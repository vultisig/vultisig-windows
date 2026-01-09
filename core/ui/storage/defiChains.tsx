import { Chain } from '@core/chain/Chain'
import { useCurrentVaultChains } from '@core/ui/vault/state/currentVaultCoins'
import { useAvailableChains } from '@core/ui/vault/state/useAvailableChains'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { featureFlags } from '../featureFlags'
import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

const supportedDefiChains: Chain[] = [
  Chain.THORChain,
  ...(featureFlags.mayaChainDefi ? [Chain.MayaChain] : []),
]

export const initialDefiChains: Chain[] = []

type GetDefiChainsFunction = () => Promise<Chain[]>
type SetDefiChainsFunction = (chains: Chain[]) => Promise<void>

export type DefiChainsStorage = {
  getDefiChains: GetDefiChainsFunction
  setDefiChains: SetDefiChainsFunction
}

const useDefiChainsQuery = () => {
  const { getDefiChains } = useCore()

  return useQuery({
    queryKey: [StorageKey.defiChains],
    queryFn: getDefiChains,
    ...noRefetchQueryOptions,
  })
}

export const useDefiChains = () => {
  const allowedDefiChains = useSupportedDefiChainsForVault()
  const { data } = useDefiChainsQuery()

  const resolved = data ?? initialDefiChains
  return resolved.filter(chain => allowedDefiChains.includes(chain))
}

const useSetDefiChainsMutation = () => {
  const { setDefiChains } = useCore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setDefiChains,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [StorageKey.defiChains] })
    },
  })
}

export const useToggleDefiChain = () => {
  const defiChains = useDefiChains()
  const allowedDefiChains = useSupportedDefiChainsForVault()
  const { mutate: setDefiChains, isPending } = useSetDefiChainsMutation()

  const toggleChain = (chain: Chain) => {
    const isSelected = defiChains.includes(chain)

    if (!isSelected && !allowedDefiChains.includes(chain)) {
      return
    }

    if (isSelected) {
      // Remove chain
      setDefiChains(defiChains.filter(c => c !== chain))
    } else {
      // Add chain
      setDefiChains([...defiChains, chain])
    }
  }

  return { toggleChain, isPending }
}

export const useSupportedDefiChainsForVault = () => {
  const vaultChains = useCurrentVaultChains()
  const availableChains = useAvailableChains()

  return useMemo(
    () =>
      supportedDefiChains.filter(
        chain => vaultChains.includes(chain) && availableChains.includes(chain)
      ),
    [vaultChains, availableChains]
  )
}
