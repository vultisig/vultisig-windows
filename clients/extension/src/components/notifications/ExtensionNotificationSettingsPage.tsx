import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { NotificationSettingsContent } from '@core/ui/notifications/settings/NotificationSettingsContent'
import { toVaultNotificationItems } from '@core/ui/notifications/settings/toVaultNotificationItems'
import { useVaults } from '@core/ui/storage/vaults'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
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
  const navigate = useCoreNavigate()
  const storedVaults = useVaults()
  const vaultsWithChain = storedVaults.filter(v => v.hexChainCode)
  const { data: enabledById = {} } = useExtensionAllVaultsNotificationStates()

  const { mutate: toggleVault, isPending: isTogglingVault } =
    useExtensionToggleVaultNotificationMutation()
  const { mutate: toggleAll, isPending: isTogglingAll } =
    useExtensionToggleAllVaultsNotificationMutation()
  const isPending = isTogglingVault || isTogglingAll

  const vaults = toVaultNotificationItems(vaultsWithChain, enabledById)
  const anyEnabled = vaults.some(v => v.enabled)

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
          onVaultToggle={(vaultId, enabled) => {
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
      </PageContent>
    </VStack>
  )
}
