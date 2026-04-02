import { useVaults } from '@core/ui/storage/vaults'
import { computeNotificationVaultId } from '@vultisig/sdk'
import { useEffect, useRef } from 'react'

import { registerDesktopDevice } from './desktopNotificationApi'
import {
  getDesktopNotificationRegistrations,
  setDesktopNotificationRegistration,
} from './desktopNotificationStorage'
import { getOrCreateDesktopNotificationToken } from './desktopNotificationToken'

/** Re-registers locally-opted-in vaults with the backend on startup. */
export const AutoRegisterDesktopNotifications = () => {
  const vaults = useVaults()
  const didRunRef = useRef(false)

  useEffect(() => {
    // One-shot on first non-empty vault list: re-register stored opt-ins after app start.
    // New imports later in the same session are covered by the enable mutation.
    if (didRunRef.current || vaults.length === 0) return
    didRunRef.current = true

    void (async () => {
      const registrations = getDesktopNotificationRegistrations()
      const token = getOrCreateDesktopNotificationToken()

      for (const vault of vaults) {
        const vaultId = await computeNotificationVaultId(
          vault.publicKeys.ecdsa,
          vault.hexChainCode
        )

        if (Object.hasOwn(registrations, vaultId)) {
          try {
            await registerDesktopDevice({
              vaultId,
              partyName: vault.localPartyId,
              token,
            })
            setDesktopNotificationRegistration({
              vaultId,
              partyName: vault.localPartyId,
            })
          } catch {
            // Silently continue — the next app restart will retry.
          }
        }
      }
    })()
  }, [vaults])

  return null
}
