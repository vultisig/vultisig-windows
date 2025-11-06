import { VaultPrimaryActions } from '@core/ui/vault/components/VaultPrimaryActions'
import { useCurrentVaultChains } from '@core/ui/vault/state/currentVaultCoins'
import { Opener } from '@lib/ui/base/Opener'
import { isEmpty } from '@lib/utils/array/isEmpty'

import { ReceiveModal } from './ReceiveModal'

export const VaultOverviewPrimaryActions = () => {
  const chains = useCurrentVaultChains()

  if (isEmpty(chains)) {
    return null
  }

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <VaultPrimaryActions showActions={false} onReceive={onOpen} />
      )}
      renderContent={({ onClose }) => <ReceiveModal onClose={onClose} />}
    />
  )
}
