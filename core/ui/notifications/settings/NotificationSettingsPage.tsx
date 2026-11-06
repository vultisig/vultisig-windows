import { NotificationSettingsContent } from '@core/ui/notifications/settings/NotificationSettingsContent'
import { toVaultNotificationItems } from '@core/ui/notifications/settings/toVaultNotificationItems'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { useVaults } from '@core/ui/storage/vaults'
import { VaultSettingsContent } from '@core/ui/vault/settings/VaultSettingsContent'
import { VStack } from '@lib/ui/layout/Stack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const NotificationSettingsPage = () => {
  const { t } = useTranslation()
  const storedVaults = useVaults()
  const [pushEnabled, setPushEnabled] = useState(false)
  const [vaultEnabledById, setVaultEnabledById] = useState<
    Record<string, boolean>
  >({})

  const vaults = toVaultNotificationItems(storedVaults, vaultEnabledById)

  return (
    <VStack fullHeight>
      <SettingsPageHeader title={t('notifications')} />
      <VaultSettingsContent flexGrow gap={14} scrollable>
        <NotificationSettingsContent
          isEnabled={pushEnabled}
          onToggle={setPushEnabled}
          onVaultToggle={({ vaultId, enabled }) => {
            setVaultEnabledById(prev => ({ ...prev, [vaultId]: enabled }))
          }}
          vaults={vaults}
        />
      </VaultSettingsContent>
    </VStack>
  )
}
