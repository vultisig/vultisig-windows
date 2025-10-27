import { getVaultId } from '@core/vault/Vault'
import { ChildrenProp } from '@lib/ui/props'

import { useCurrentVaultId } from '../storage/currentVaultId'
import { useVaults } from '../storage/vaults'
import { CurrentVaultProvider } from './state/currentVault'

export const ActiveVaultOnly = ({ children }: ChildrenProp) => {
  const currentVaultId = useCurrentVaultId()

  const vaults = useVaults()
  const vault = vaults.find(vault => getVaultId(vault) === currentVaultId)

  if (!vault) {
    return null
  }

  return <CurrentVaultProvider value={vault}>{children}</CurrentVaultProvider>
}
