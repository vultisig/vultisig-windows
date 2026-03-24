import { getPushNotificationVaultId } from '@core/ui/notifications/computeNotificationVaultId'
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

    let cancelled = false

    ;(async () => {
      const message: PushRegisterVaultsMessage = {
        type: pushRegisterVaultsType,
        vaults: await Promise.all(
          vaults.map(async vault => ({
            vaultId: await getPushNotificationVaultId(vault),
            localPartyId: vault.localPartyId,
          }))
        ),
      }

      if (cancelled) return

      chrome.runtime
        .sendMessage(message)
        .catch(error =>
          console.error(
            '[Vultisig] Failed to send push registration message:',
            error
          )
        )
    })()

    return () => {
      cancelled = true
    }
  }, [vaults])

  return null
}
