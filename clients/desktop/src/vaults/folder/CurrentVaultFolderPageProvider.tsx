import { useAppNavigate } from '@lib/ui/navigation/hooks/useAppNavigate'
import { useAppPathParams } from '@lib/ui/navigation/hooks/useAppPathParams'
import { ChildrenProp } from '@lib/ui/props'
import { useEffect } from 'react'

import { useVaultFolder } from '../folders/queries/useVaultFoldersQuery'
import { VaultFolderProvider } from './state/currentVaultFolder'

export const CurrentVaultFolderPageProvider = ({ children }: ChildrenProp) => {
  const [{ id }] = useAppPathParams<'vaultFolder'>()

  const value = useVaultFolder(id)

  const navigate = useAppNavigate()

  useEffect(() => {
    if (!value) {
      navigate('vaults')
    }
  }, [navigate, value])

  if (!value) {
    return null
  }

  return <VaultFolderProvider value={value}>{children}</VaultFolderProvider>
}
