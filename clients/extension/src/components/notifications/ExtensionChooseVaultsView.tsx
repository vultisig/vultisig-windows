import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ChooseVaultsPage } from '@core/ui/notifications/choose-vaults/ChooseVaultsPage'
import { toVaultNotificationItems } from '@core/ui/notifications/settings/toVaultNotificationItems'
import { useVaults } from '@core/ui/storage/vaults'

import { useExtensionAllVaultsNotificationStates } from '../../notifications/useExtensionAllVaultsNotificationStates'
import {
  useExtensionToggleAllVaultsNotificationMutation,
  useExtensionToggleVaultNotificationMutation,
} from '../../notifications/useExtensionVaultNotificationMutations'

export const ExtensionChooseVaultsView = () => {
  const navigate = useCoreNavigate()
  const storedVaults = useVaults()
  const { data: enabledById = {} } = useExtensionAllVaultsNotificationStates()
  const { mutate: toggleVault, isPending: isTogglingVault } =
    useExtensionToggleVaultNotificationMutation()
  const { mutate: toggleAll, isPending: isTogglingAll } =
    useExtensionToggleAllVaultsNotificationMutation()
  const isPending = isTogglingVault || isTogglingAll

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
        if (isPending) return
        toggleAll({
          vaults: storedVaults.map(v => ({
            ecdsa: v.publicKeys.ecdsa,
            hexChainCode: v.hexChainCode,
            localPartyId: v.localPartyId,
          })),
          enabled,
        })
      }}
      onVaultToggle={(vaultId, enabled) => {
        if (isPending) return
        const vault = storedVaults.find(v => v.publicKeys.ecdsa === vaultId)
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
  )
}
