import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ChooseVaultsPage } from '@core/ui/notifications/choose-vaults/ChooseVaultsPage'
import { toVaultNotificationItems } from '@core/ui/notifications/settings/toVaultNotificationItems'
import { useVaults } from '@core/ui/storage/vaults'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { useState } from 'react'

export const ChooseVaultsView = () => {
  const navigate = useCoreNavigate()
  const storedVaults = useVaults()
  // TODO: persist per-vault notification choices before leaving (currently in-memory only).
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
