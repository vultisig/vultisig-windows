import { NonEmptyOnly } from '../../lib/ui/base/NonEmptyOnly';
import { useFolderlessVaults } from '../../vault/queries/useVaultsQuery';
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
          {items.map((vault, index) => (
            <VaultListItem
              key={index}
              id={getStorageVaultId(vault)}
              name={vault.name}
            />
          ))}
        </VaultsContainer>
      )}
    />
  );
};
