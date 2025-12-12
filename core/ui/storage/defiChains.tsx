import { Chain } from '@core/chain/Chain'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { featureFlags } from '../featureFlags'
import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const supportedDefiChains: Chain[] = [
  Chain.THORChain,
  ...(featureFlags.mayaChainDefi ? [Chain.MayaChain] : []),
]

export const initialDefiChains: Chain[] = supportedDefiChains

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
  const { data } = useDefiChainsQuery()

  const resolved = data ?? initialDefiChains
  return resolved.filter(chain => supportedDefiChains.includes(chain))
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
  const { mutate: setDefiChains, isPending } = useSetDefiChainsMutation()

  const toggleChain = (chain: Chain) => {
    const isSelected = defiChains.includes(chain)

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
