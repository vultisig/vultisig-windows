import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { useCreateCoinMutation } from '@core/ui/storage/coins'
import { useCurrentVaultChains } from '@core/ui/vault/state/currentVaultCoins'
import { useAvailableChains } from '@core/ui/vault/state/useAvailableChains'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { featureFlags } from '../featureFlags'
import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const supportedDefiChains = [
  Chain.THORChain,
  ...(featureFlags.mayaChain ? [Chain.MayaChain] : []),
] as const satisfies readonly Chain[]

export type SupportedDefiChain = (typeof supportedDefiChains)[number]

export const isSupportedDefiChain = (
  chain: Chain
): chain is SupportedDefiChain =>
  supportedDefiChains.includes(chain as SupportedDefiChain)

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

  const resolved = (data ?? initialDefiChains).filter(isSupportedDefiChain)
  return resolved.filter(chain => allowedDefiChains.includes(chain))
}

export const useSetDefiChainsMutation = () => {
  const { setDefiChains } = useCore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setDefiChains,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [StorageKey.defiChains] })
    },
  })
}

const useSupportedDefiChainsForVault = () => {
  const vaultChains = useCurrentVaultChains()

  return useMemo(
    () => supportedDefiChains.filter(chain => vaultChains.includes(chain)),
    [vaultChains]
  )
}

type DefiChainAvailability = {
  chain: SupportedDefiChain
  isInVault: boolean
  canEnable: boolean
}

export const useDefiChainAvailability = (): DefiChainAvailability[] => {
  const vaultChains = useCurrentVaultChains()
  const availableChains = useAvailableChains()

  return useMemo(
    () =>
      supportedDefiChains.map(chain => ({
        chain,
        isInVault: vaultChains.includes(chain),
        canEnable: availableChains.includes(chain),
      })),
    [vaultChains, availableChains]
  )
}

export const useToggleDefiChainWithAutoEnable = () => {
  const defiChains = useDefiChains()
  const vaultChains = useCurrentVaultChains()
  const availableChains = useAvailableChains()
  const { mutate: setDefiChains, isPending: isSettingDefiChains } =
    useSetDefiChainsMutation()
  const createCoinMutation = useCreateCoinMutation()
  const queryClient = useQueryClient()

  const toggleChain = async (chain: Chain) => {
    if (!isSupportedDefiChain(chain)) return

    const isSelected = defiChains.includes(chain)

    if (isSelected) {
      setDefiChains(defiChains.filter(c => c !== chain))
      return
    }

    // Selecting
    const isInVault = vaultChains.includes(chain)
    if (!isInVault) {
      const canEnable = availableChains.includes(chain)
      if (!canEnable) return

      try {
        await createCoinMutation.mutateAsync(chainFeeCoin[chain])
      } catch {
        return
      }
    }

    // Read fresh defiChains from cache to avoid stale closure after await
    const currentDefiChains =
      queryClient.getQueryData<Chain[]>([StorageKey.defiChains]) ??
      initialDefiChains
    if (!currentDefiChains.includes(chain)) {
      setDefiChains([...currentDefiChains, chain])
    }
  }

  return {
    toggleChain,
    isPending: isSettingDefiChains || createCoinMutation.isPending,
  }
}
