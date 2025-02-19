import { useRouter, useSegments } from 'expo-router'
import { FC, PropsWithChildren, useEffect } from 'react'

import { useVaultsQuery } from '../hooks/queries/useVaultsQuery'

export const AuthRedirectProvider: FC<PropsWithChildren> = ({ children }) => {
  const { data: vaults = [], isFetching } = useVaultsQuery()
  const hasVault = vaults.length > 0
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    if (isFetching) return

    const inNoVaultFlow = segments[0] === 'no-vault'

    if (hasVault && inNoVaultFlow) {
      router.replace('/')
      return
    }

    if (!hasVault && !inNoVaultFlow) {
      router.replace('/no-vault')
    }
  }, [hasVault, isFetching, router, segments])

  return children
}
