import { NotificationSettingsContent } from '@core/ui/notifications/settings/NotificationSettingsContent'
import { toVaultNotificationItems } from '@core/ui/notifications/settings/toVaultNotificationItems'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { useVaults } from '@core/ui/storage/vaults'
import { VaultSettingsContent } from '@core/ui/vault/settings/VaultSettingsContent'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { useTranslation } from 'react-i18next'

import { useExtensionAllVaultsNotificationStates } from '../../notifications/useExtensionAllVaultsNotificationStates'
import {
  useExtensionToggleAllVaultsNotificationMutation,
  useExtensionToggleVaultNotificationMutation,
} from '../../notifications/useExtensionVaultNotificationMutations'

/** Extension settings page for per-vault push notification toggles. */
export const ExtensionNotificationSettingsPage = () => {
  const { t } = useTranslation()
  const storedVaults = useVaults()
  const vaultsWithChain = storedVaults.filter(v => v.hexChainCode)
  const {
    data: enabledById = {},
    isPending: isLoadingStates,
    isError: hasStatesError,
    refetch: refetchStates,
  } = useExtensionAllVaultsNotificationStates()

  const { mutate: toggleVault, isPending: isTogglingVault } =
    useExtensionToggleVaultNotificationMutation()
  const { mutate: toggleAll, isPending: isTogglingAll } =
    useExtensionToggleAllVaultsNotificationMutation()
  const isPending =
    isLoadingStates || hasStatesError || isTogglingVault || isTogglingAll

  const vaults = toVaultNotificationItems(vaultsWithChain, enabledById)
  const anyEnabled = vaults.some(v => v.enabled)

  return (
    <VStack fullHeight>
      <SettingsPageHeader title={t('notifications')} />
      <VaultSettingsContent flexGrow gap={14} scrollable>
        {hasStatesError ? (
          <VStack gap={12} alignItems="center">
            <Text color="danger" size={14}>
              {t('failed_to_load')}
            </Text>
            <Button
              kind="secondary"
              onClick={() => {
                void refetchStates()
              }}
            >
              {t('try_again')}
            </Button>
          </VStack>
        ) : null}
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
