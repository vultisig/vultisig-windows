import { useNavigate } from 'react-router-dom';

import { ListItem } from '../../lib/ui/list/item/ListItem';
import { makeAppPath } from '../../navigation';
import { useCurrentVaultId } from '../../vault/state/currentVaultId';

type VaultListItemProps = {
  isDraggable?: boolean;
  name: string;
  id: string;
};

export const VaultListItem = ({
  name,
  id,
  isDraggable,
}: VaultListItemProps) => {
  const navigate = useNavigate();
  const [, setSelectedVault] = useCurrentVaultId();

  return (
    <ListItem
      isDraggable={isDraggable}
      title={name}
      onClick={() => {
        setSelectedVault(id);
        navigate(makeAppPath('vault'));
      }}
    />
  );
};
