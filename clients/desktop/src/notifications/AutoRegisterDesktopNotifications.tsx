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
    // Allow a future run after the user clears all vaults and loads vaults again.
    if (vaults.length === 0) {
      didRunRef.current = false
      return
    }

    // One-shot per non-empty vault list: re-register stored opt-ins after app start.
    // New imports later in the same session are covered by the enable mutation.
    if (didRunRef.current) return
    didRunRef.current = true

    let aborted = false

    void (async () => {
      const registrations = getDesktopNotificationRegistrations()
      const token = getOrCreateDesktopNotificationToken()

      for (const vault of vaults) {
        if (aborted) return

        const vaultId = await computeNotificationVaultId(
          vault.publicKeys.ecdsa,
          vault.hexChainCode
        )

        if (aborted) return

        if (Object.hasOwn(registrations, vaultId)) {
          try {
            await registerDesktopDevice({
              vaultId,
              partyName: vault.localPartyId,
              token,
            })
            if (aborted) return
            setDesktopNotificationRegistration({
              vaultId,
              partyName: vault.localPartyId,
            })
          } catch (error) {
            console.warn(
              'Failed to re-register desktop push notifications for vault',
              { vaultId, error }
            )
          }
        }
      }
    })()

    return () => {
      aborted = true
    }
  }, [vaults])

  return null
}
