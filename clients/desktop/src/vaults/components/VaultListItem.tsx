import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useSetCurrentVaultId } from '@core/ui/vault/state/setCurrentVaultId'
import { getVaultId } from '@core/ui/vault/Vault'

import { ListItem } from '../../lib/ui/list/item/ListItem'
import { VaultDescription } from './VaultDescription'

type VaultListItemProps = {
  isDraggable?: boolean
}

export const VaultListItem = ({ isDraggable }: VaultListItemProps) => {
  const navigate = useCoreNavigate()
  const setCurrentVaultId = useSetCurrentVaultId()
  const vault = useCurrentVault()

  return (
    <ListItem
      isDraggable={isDraggable}
      onClick={() => {
        setCurrentVaultId(getVaultId(vault))
        navigate('vault')
      }}
    >
      <VaultDescription />
    </ListItem>
  )
}
