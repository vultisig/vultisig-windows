import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ChooseVaultsPage } from '@core/ui/notifications/choose-vaults/ChooseVaultsPage'
import { toVaultNotificationItems } from '@core/ui/notifications/settings/toVaultNotificationItems'
import { useVaults } from '@core/ui/storage/vaults'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'

import { useExtensionAllVaultsNotificationStates } from '../../notifications/useExtensionAllVaultsNotificationStates'
import {
  useExtensionToggleAllVaultsNotificationMutation,
  useExtensionToggleVaultNotificationMutation,
} from '../../notifications/useExtensionVaultNotificationMutations'

/** Extension choose-vaults screen: toggles push registration per vault. */
export const ExtensionChooseVaultsView = () => {
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
  )
}
