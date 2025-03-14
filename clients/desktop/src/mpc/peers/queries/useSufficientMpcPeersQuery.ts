import { getKeygenThreshold } from '@core/mpc/getKeygenThreshold'
import { useMemo } from 'react'

import { Query } from '../../../lib/ui/query/Query'
import { useCurrentVault } from '../../../vault/state/currentVault'
import { useMpcPeersQuery } from './useMpcPeersQuery'

export const useSufficientMpcPeersQuery = (): Query<string[]> => {
  const peersQuery = useMpcPeersQuery()

  const vault = useCurrentVault()
  const threshold = getKeygenThreshold(vault.signers.length)

  return useMemo(() => {
    const { data, error, isLoading } = peersQuery

    if (error || (data && data.length >= threshold)) {
      return peersQuery
    }

    return {
      error,
      data: undefined,
      isLoading,
      isPending: true,
    }
  }, [peersQuery, threshold])
}
