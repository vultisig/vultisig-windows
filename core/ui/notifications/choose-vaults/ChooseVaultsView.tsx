import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ChooseVaultsPage } from '@core/ui/notifications/choose-vaults/ChooseVaultsPage'
import { toVaultNotificationItems } from '@core/ui/notifications/settings/toVaultNotificationItems'
import { useVaults } from '@core/ui/storage/vaults'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { useState } from 'react'

/**
 * Default choose-vaults view for shared `core` navigation only (`sharedViews`).
 * It keeps toggle state in memory because `core` has no push-registration storage.
 *
 * **Shipping clients do not use this component:** `clients/desktop` and
 * `clients/extension` replace `chooseVaults` with `DesktopChooseVaultsView` and
 * `ExtensionChooseVaultsView`, which read/write real registration state via the
 * notification service. Any “persist before Done” requirement applies there, not
 * here.
 */
export const ChooseVaultsView = () => {
  const navigate = useCoreNavigate()
  const storedVaults = useVaults()
  const [enabledById, setEnabledById] = useState<Record<string, boolean>>({})

  const vaults = toVaultNotificationItems(storedVaults, enabledById)
  const allEnabled = vaults.length > 0 && vaults.every(v => v.enabled)

  const goBack = () => {
    navigate({ id: 'notificationSettings' })
  }

  return (
    <ChooseVaultsPage
      allEnabled={allEnabled}
      onBack={goBack}
      onDone={goBack}
      onEnableAll={enabled => {
        setEnabledById(prev => {
          const next = { ...prev }
          for (const v of storedVaults) {
            next[getVaultId(v)] = enabled
          }
          return next
        })
      }}
      onVaultToggle={(vaultId, enabled) => {
        setEnabledById(prev => ({ ...prev, [vaultId]: enabled }))
      }}
      vaults={vaults}
    />
  )
}
