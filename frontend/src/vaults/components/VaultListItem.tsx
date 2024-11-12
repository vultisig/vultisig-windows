import { useNavigate } from 'react-router-dom';

import { ListItem } from '../../lib/ui/list/item/ListItem';
import { makeAppPath } from '../../navigation';
import { useCurrentVault } from '../../vault/state/currentVault';
import { useCurrentVaultId } from '../../vault/state/currentVaultId';
import { getStorageVaultId } from '../../vault/utils/storageVault';

type VaultListItemProps = {
  isDraggable?: boolean;
};

export const VaultListItem = ({ isDraggable }: VaultListItemProps) => {
  const navigate = useNavigate();
  const [, setSelectedVault] = useCurrentVaultId();
  const vault = useCurrentVault();

  return (
    <ListItem
      isDraggable={isDraggable}
      title={vault.name}
      onClick={() => {
        setSelectedVault(getStorageVaultId(vault));
        navigate(makeAppPath('vault'));
      }}
    />
  );
};
