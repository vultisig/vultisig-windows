import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { Query } from '@lib/ui/query/Query'
import { useMemo } from 'react'

import { useCurrentVault } from '../../../vault/state/currentVault'
import { useMpcPeersQuery } from './useMpcPeersQuery'

export const useSufficientMpcPeersQuery = (): Query<string[]> => {
  const peersQuery = useMpcPeersQuery()

  const vault = useCurrentVault()
  const threshold = getKeygenThreshold(vault.signers.length)
  const sufficientPeers = threshold - 1

  return useMemo(() => {
    const { data, error, isLoading } = peersQuery

    if (error || (data && data.length >= sufficientPeers)) {
      return peersQuery
    }

    return {
      error,
      data: undefined,
      isLoading,
      isPending: true,
    }
  }, [peersQuery, sufficientPeers])
}
