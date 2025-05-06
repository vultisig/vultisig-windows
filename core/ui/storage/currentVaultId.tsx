import { useCore } from '@core/ui/state/core'
import { ChildrenProp, ValueProp } from '@lib/ui/props'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'

import { currentVaultIdQueryKey } from '../query/keys'
import { getVaultId } from '../vault/Vault'
import { useVaults } from './vaults'

export type CurrentVaultId = string | null

export const initialCurrentVaultId: CurrentVaultId = null

const {
  useValue: useCurrentVaultId,
  provider: InternalCurrentVaultIdProvider,
} = getValueProviderSetup<CurrentVaultId>('CurrentVaultId')

export { useCurrentVaultId }

export const useAssertCurrentVaultId = () => {
  const currentVaultId = useCurrentVaultId()

  return shouldBePresent(currentVaultId, 'CurrentVaultId')
}

export const useCurrentVaultIdQuery = () => {
  const { getCurrentVaultId } = useCore()

  return useQuery({
    queryKey: currentVaultIdQueryKey,
    queryFn: getCurrentVaultId,
  })
}

export const CurrentVaultIdProvider = ({
  children,
  value,
}: ChildrenProp & ValueProp<string>) => {
  const vaults = useVaults()

  const guardedValue = useMemo(() => {
    if (!vaults.length) return null

    const vault = vaults.find(vault => getVaultId(vault) === value)

    return vault ? value : getVaultId(vaults[0])
  }, [vaults, value])

  const { mutate, isPending } = useSetCurrentVaultIdMutation()

  useEffect(() => {
    if (isPending || guardedValue === value) return

    mutate(value)
  }, [guardedValue, value, isPending, mutate])

  return (
    <InternalCurrentVaultIdProvider value={guardedValue}>
      {children}
    </InternalCurrentVaultIdProvider>
  )
}

export const useSetCurrentVaultIdMutation = (
  options?: UseMutationOptions<any, any, CurrentVaultId, unknown>
) => {
  const invalidateQueries = useInvalidateQueries()

  const { setCurrentVaultId } = useCore()

  const mutationFn = async (value: CurrentVaultId) => {
    await setCurrentVaultId(value)

    await invalidateQueries(currentVaultIdQueryKey)
  }

  return useMutation({
    mutationFn,
    ...options,
  })
}
