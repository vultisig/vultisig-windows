import { ChildrenProp, ValueProp } from '@lib/ui/props'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'

import { currentVaultIdQueryKey } from '../../query/keys'
import { useCoreStorage } from '../../state/storage'
import { useSetCurrentVaultIdMutation } from '../mutations/useSetCurrentVaultIdMutation'
import { getVaultId } from '../Vault'
import { useVaults } from './vaults'

export type CurrentVaultId = string | null

export const initialCurrentVaultId: CurrentVaultId = null

const {
  useValue: useCurrentVaultId,
  provider: InternalCurrentVaultIdProvider,
} = getValueProviderSetup<CurrentVaultId>('CurrentVaultId')

export { useCurrentVaultId }

export const useCurrentVaultIdQuery = () => {
  const { getCurrentVaultId } = useCoreStorage()

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
