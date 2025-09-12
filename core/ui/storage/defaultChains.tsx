import { Chain } from '@core/chain/Chain'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

type GetDefaultChainsFunction = () => Promise<Chain[]>

export type DefaultChainsStorage = {
  getDefaultChains: GetDefaultChainsFunction
}

export const initialDefaultChains = [
  Chain.Bitcoin,
  Chain.Ethereum,
  Chain.THORChain,
  Chain.Solana,
  Chain.BSC,
]

export const useDefaultChainsQuery = () => {
  const { getDefaultChains } = useCore()

  return useQuery({
    queryKey: [StorageKey.defaultChains],
    queryFn: getDefaultChains,
    ...noRefetchQueryOptions,
  })
}
