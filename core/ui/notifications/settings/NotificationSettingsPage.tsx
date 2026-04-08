import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { NotificationSettingsContent } from '@core/ui/notifications/settings/NotificationSettingsContent'
import { toVaultNotificationItems } from '@core/ui/notifications/settings/toVaultNotificationItems'
import { useVaults } from '@core/ui/storage/vaults'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const NotificationSettingsPage = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const storedVaults = useVaults()
  const [pushEnabled, setPushEnabled] = useState(false)
  const [vaultEnabledById, setVaultEnabledById] = useState<
    Record<string, boolean>
  >({})

  const vaults = toVaultNotificationItems(storedVaults, vaultEnabledById)

  return (
    <VStack fullHeight>
      <PageHeader
        hasBorder
        primaryControls={
          <PageHeaderBackButton
            onClick={() => {
              navigate({ id: 'settings' })
            }}
          />
        }
        title={t('notifications')}
      />
      <PageContent flexGrow gap={14} scrollable>
        <NotificationSettingsContent
          isEnabled={pushEnabled}
          onToggle={setPushEnabled}
          onVaultToggle={(vaultId, enabled) => {
            setVaultEnabledById(prev => ({ ...prev, [vaultId]: enabled }))
          }}
          vaults={vaults}
        />
      </PageContent>
    </VStack>
  )
}
