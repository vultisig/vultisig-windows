import { storage } from '../../../../wailsjs/go/models';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithOptionsProps, InputProps } from '../../../lib/ui/props';
import { without } from '../../../lib/utils/array/without';
import { getStorageVaultId } from '../../../vault/utils/storageVault';
import { FolderVaultOption } from './FolderVaultOption';

type FolderVaultsInputProps = InputProps<string[]> &
  ComponentWithOptionsProps<storage.Vault> & {};

export const FolderVaultsInput: React.FC<FolderVaultsInputProps> = ({
  value,
  onChange,
  options,
}) => {
  return (
    <VStack gap={24}>
      <VStack gap={8}>
        {options.map(vault => {
          const vaultId = getStorageVaultId(vault);

          return (
            <FolderVaultOption
              value={value.includes(vaultId)}
              onChange={item =>
                onChange(item ? [...value, vaultId] : without(value, vaultId))
              }
              key={vaultId}
              title={vault.name}
            />
          );
        })}
      </VStack>
    </VStack>
  );
};
