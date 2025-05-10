import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useVaultFolder } from '@core/ui/storage/vaultFolders'
import { ChildrenProp } from '@lib/ui/props'
import { useEffect } from 'react'

import { useCorePathParams } from '../../navigation/hooks/useCorePathParams'
import { VaultFolderProvider } from './state/currentVaultFolder'

export const CurrentVaultFolderPageProvider = ({ children }: ChildrenProp) => {
  const [{ id }] = useCorePathParams<'vaultFolder'>()

  const value = useVaultFolder(id)

  const navigate = useCoreNavigate()

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
