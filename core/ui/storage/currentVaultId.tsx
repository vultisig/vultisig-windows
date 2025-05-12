import { useCore } from '@core/ui/state/core'
import { ChildrenProp, ValueProp } from '@lib/ui/props'
import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { fixedDataQueryOptions } from '@lib/ui/query/utils/options'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import {
  useMutation,
  UseMutationOptions,
  useQuery,
} from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef } from 'react'

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
    ...fixedDataQueryOptions,
  })
}

export const CurrentVaultIdProvider = ({
  children,
  value,
}: ChildrenProp & ValueProp<string>) => {
  const vaults = useVaults()
  const previousValueRef = useRef<string | null>(null)
  const previousGuardedValueRef = useRef<string | null>(null)

  const guardedValue = useMemo(() => {
    if (!vaults.length) return null

    const vault = vaults.find(vault => getVaultId(vault) === value)

    return vault ? value : getVaultId(vaults[0])
  }, [vaults, value])

  const invalidateQueries = useInvalidateQueries()
  const core = useCore()
  
  // Store setCurrentVaultId in a ref to avoid dependency changes
  const setCurrentVaultIdRef = useRef(core.setCurrentVaultId)
  useEffect(() => {
    setCurrentVaultIdRef.current = core.setCurrentVaultId
  }, [core.setCurrentVaultId])

  // Stable mutation function with useCallback
  const mutationFn = useCallback(async (newValue: CurrentVaultId) => {
    if (newValue === previousValueRef.current) return
    previousValueRef.current = newValue
    await setCurrentVaultIdRef.current(newValue)
    await invalidateQueries(currentVaultIdQueryKey)
  }, [invalidateQueries]); // Only depends on invalidateQueries (and not core to avoid infinite calls)

  // Use the stable mutation function
  const { mutate, isPending } = useMutation({
    mutationFn
  })

  // Only trigger mutation when guardedValue changes, not on every render
  useEffect(() => {
    if (guardedValue === previousGuardedValueRef.current || isPending) return
    previousGuardedValueRef.current = guardedValue
    mutate(guardedValue)
  }, [guardedValue, isPending, mutate])

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

  const mutationFn = useCallback(async (value: CurrentVaultId) => {
    await setCurrentVaultId(value)
    await invalidateQueries(currentVaultIdQueryKey)
  }, [invalidateQueries, setCurrentVaultId])

  return useMutation({
    mutationFn,
    ...options,
  })
}
