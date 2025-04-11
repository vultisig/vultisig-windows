import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'

import { ListItem } from '../../lib/ui/list/item/ListItem'
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { useCurrentVaultId } from '../../vault/state/currentVaultId'
import { VaultDescription } from './VaultDescription'

type VaultListItemProps = {
  isDraggable?: boolean
}

export const VaultListItem = ({ isDraggable }: VaultListItemProps) => {
  const navigate = useAppNavigate()
  const [, setSelectedVault] = useCurrentVaultId()
  const vault = useCurrentVault()

  return (
    <ListItem
      isDraggable={isDraggable}
      onClick={() => {
        setSelectedVault(getVaultId(vault))
        navigate('vault')
      }}
    >
      <VaultDescription />
    </ListItem>
  )
}
