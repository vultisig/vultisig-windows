import { NonEmptyOnly } from '../../lib/ui/base/NonEmptyOnly';
import { useFolderlessVaults } from '../../vault/queries/useVaultsQuery';
import { CurrentVaultProvider } from '../../vault/state/currentVault';
import { getStorageVaultId } from '../../vault/utils/storageVault';
import { VaultListItem } from './VaultListItem';
import { VaultsContainer } from './VaultsContainer';

export const Vaults = () => {
  const vaults = useFolderlessVaults();

  return (
    <NonEmptyOnly
      value={vaults}
      render={items => (
        <VaultsContainer>
          {items.map(vault => (
            <CurrentVaultProvider value={vault} key={getStorageVaultId(vault)}>
              <VaultListItem />
            </CurrentVaultProvider>
          ))}
        </VaultsContainer>
      )}
    />
  );
};
