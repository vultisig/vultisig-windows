import { currentVaultIdQueryKey } from '@core/ui/query/keys'
import { useSetCurrentVaultIdMutation } from '@core/ui/vault/mutations/useSetCurrentVaultIdMutation'
import {
  CurrentVaultId,
  CurrentVaultIdProvider as CoreCurrentVaultIdProvider,
  getInitialVaultId,
  useCurrentVaultIdCorrector,
} from '@core/ui/vault/state/currentVaultId'
import { SetCurrentVaultIdFunction } from '@core/ui/vault/state/setCurrentVaultId'
import { useVaults } from '@core/ui/vault/state/vaults'
import { ChildrenProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { useEffect } from 'react'

import { setPersistentState } from '../../state/persistent/setPersistentState'
import { usePersistentStateQuery } from '../../state/persistent/usePersistentStateQuery'

const [key] = currentVaultIdQueryKey

export const setCurrentVaultId: SetCurrentVaultIdFunction = async value => {
  await setPersistentState(key, value)
}

const useCurrentVaultIdQuery = () => {
  const vaults = useVaults()
  return usePersistentStateQuery<CurrentVaultId>(key, getInitialVaultId(vaults))
}

const useGuardedCurrentVaultIdProvider = () => {
  const query = useCurrentVaultIdQuery()

  const guardedQuery = useTransformQueryData(
    query,
    useCurrentVaultIdCorrector()
  )

  const { mutate, isPending } = useSetCurrentVaultIdMutation()

  const value = query.data
  const guardedValue = guardedQuery.data

  useEffect(() => {
    if (value === undefined || guardedValue === undefined) return

    if (isPending) return

    if (guardedValue === value) return

    mutate(value)
  }, [guardedValue, value, isPending, mutate])

  return guardedQuery
}

export const CurrentVaultIdProvider = ({ children }: ChildrenProp) => {
  const query = useGuardedCurrentVaultIdProvider()

  return (
    <MatchQuery
      value={query}
      success={data => (
        <CoreCurrentVaultIdProvider value={data}>
          {children}
        </CoreCurrentVaultIdProvider>
      )}
    />
  )
}
