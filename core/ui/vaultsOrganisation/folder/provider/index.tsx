import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useVaultFolder } from '@core/ui/storage/vaultFolders'
import { VaultFolderProvider } from '@core/ui/vaultsOrganisation/folder/state/currentVaultFolder'
import { ChildrenProp } from '@lib/ui/props'
import { useEffect } from 'react'

export const CurrentVaultFolderPageProvider = ({ children }: ChildrenProp) => {
  const [{ id }] = useCoreViewState<'vaultFolder'>()
  const navigate = useCoreNavigate()
  const value = useVaultFolder(id)

  useEffect(() => {
    if (!value) {
      navigate({ id: 'vaults' })
    }
  }, [navigate, value])

  return value ? (
    <VaultFolderProvider value={value}>{children}</VaultFolderProvider>
  ) : null
}
