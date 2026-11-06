import { NotificationSettingsContent } from '@core/ui/notifications/settings/NotificationSettingsContent'
import { toVaultNotificationItems } from '@core/ui/notifications/settings/toVaultNotificationItems'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { useVaults } from '@core/ui/storage/vaults'
import { VaultSettingsContent } from '@core/ui/vault/settings/VaultSettingsContent'
import { VStack } from '@lib/ui/layout/Stack'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { useTranslation } from 'react-i18next'

import { useDesktopAllVaultsNotificationStates } from './useDesktopAllVaultsNotificationStates'
import {
  useDesktopToggleAllVaultsNotificationMutation,
  useDesktopToggleVaultNotificationMutation,
} from './useDesktopVaultNotificationMutations'

export const DesktopNotificationSettingsPage = () => {
  const { t } = useTranslation()
  const storedVaults = useVaults()
  const vaultsWithChain = storedVaults.filter(v => v.hexChainCode)
  const { data: enabledById = {} } = useDesktopAllVaultsNotificationStates()

  const { mutate: toggleVault, isPending: isTogglingVault } =
    useDesktopToggleVaultNotificationMutation()
  const { mutate: toggleAll, isPending: isTogglingAll } =
    useDesktopToggleAllVaultsNotificationMutation()
  const isPending = isTogglingVault || isTogglingAll

  const vaults = toVaultNotificationItems(vaultsWithChain, enabledById)
  const anyEnabled = vaults.some(v => v.enabled)

  return (
    <VStack fullHeight>
      <SettingsPageHeader title={t('notifications')} />
      <VaultSettingsContent flexGrow gap={14} scrollable>
        <NotificationSettingsContent
          isEnabled={anyEnabled}
          isPending={isPending}
          onToggle={enabled => {
            if (isPending) return
            toggleAll({
              vaults: vaultsWithChain.map(v => ({
                ecdsa: v.publicKeys.ecdsa,
                hexChainCode: v.hexChainCode,
                localPartyId: v.localPartyId,
              })),
              enabled,
            })
          }}
          onVaultToggle={({ vaultId, enabled }) => {
            if (isPending) return
            const vault = vaultsWithChain.find(v => getVaultId(v) === vaultId)
            if (!vault) return

            toggleVault({
              ecdsa: vault.publicKeys.ecdsa,
              hexChainCode: vault.hexChainCode,
              localPartyId: vault.localPartyId,
              enabled,
            })
          }}
          vaults={vaults}
        />
      </VaultSettingsContent>
    </VStack>
  )
}
