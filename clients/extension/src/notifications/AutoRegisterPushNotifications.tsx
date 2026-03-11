import { getVaultId } from '@core/mpc/vault/Vault'
import { useVaults } from '@core/ui/storage/vaults'
import { useEffect } from 'react'

import {
  PushRegisterVaultsMessage,
  pushRegisterVaultsType,
} from './pushNotificationMessages'

export const AutoRegisterPushNotifications = () => {
  const vaults = useVaults()

  useEffect(() => {
    if (vaults.length === 0) return

    const message: PushRegisterVaultsMessage = {
      type: pushRegisterVaultsType,
      vaults: vaults.map(vault => ({
        vaultId: getVaultId(vault),
        localPartyId: vault.localPartyId,
      })),
    }

    chrome.runtime
      .sendMessage(message)
      .catch(error =>
        console.error(
          '[Vultisig] Failed to send push registration message:',
          error
        )
      )
  }, [vaults])

  return null
}
