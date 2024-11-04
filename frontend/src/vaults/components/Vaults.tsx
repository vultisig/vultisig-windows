import { useFolderlessVaults } from '../../vault/queries/useVaultsQuery';
import { getStorageVaultId } from '../../vault/utils/storageVault';
import { VaultListItem } from './VaultListItem';
import { VaultsContainer } from './VaultsContainer';

export const Vaults = () => {
  const vaults = useFolderlessVaults();

  return (
    <VaultsContainer>
      {vaults.map((vault, index) => (
        <VaultListItem
          key={index}
          id={getStorageVaultId(vault)}
          name={vault.name}
        />
      ))}
    </VaultsContainer>
  );
};
