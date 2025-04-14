import { CurrentVaultProvider } from '@core/ui/vault/state/currentVault'
import { useFolderlessVaults } from '@core/ui/vault/state/vaults'
import { getVaultId } from '@core/ui/vault/Vault'
import { NonEmptyOnly } from '@lib/ui/base/NonEmptyOnly'

import { VaultListItem } from './VaultListItem'
import { VaultsContainer } from './VaultsContainer'

export const Vaults = () => {
  const vaults = useFolderlessVaults()

  return (
    <NonEmptyOnly
      value={vaults}
      render={items => (
        <VaultsContainer>
          {items.map(vault => (
            <CurrentVaultProvider value={vault} key={getVaultId(vault)}>
              <VaultListItem />
            </CurrentVaultProvider>
          ))}
        </VaultsContainer>
      )}
    />
  )
}
