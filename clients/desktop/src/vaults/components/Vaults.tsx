import { NonEmptyOnly } from '@lib/ui/base/NonEmptyOnly'

import { useFolderlessVaults } from '../../vault/queries/useVaultsQuery'
import { CurrentVaultProvider } from '../../vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'

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
