import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { ChooseVaultsPage } from '@core/ui/notifications/choose-vaults/ChooseVaultsPage'
import { toVaultNotificationItems } from '@core/ui/notifications/settings/toVaultNotificationItems'
import { useVaults } from '@core/ui/storage/vaults'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'

import { useDesktopAllVaultsNotificationStates } from './useDesktopAllVaultsNotificationStates'
import {
  useDesktopToggleAllVaultsNotificationMutation,
  useDesktopToggleVaultNotificationMutation,
} from './useDesktopVaultNotificationMutations'

/** Desktop choose-vaults screen: toggles push per vault via notification registration APIs. */
export const DesktopChooseVaultsView = () => {
  const navigate = useCoreNavigate()
  const storedVaults = useVaults()
  const vaultsWithChain = storedVaults.filter(v => v.hexChainCode)
  const { data: enabledById = {} } = useDesktopAllVaultsNotificationStates()
  const { mutate: toggleVault, isPending: isTogglingVault } =
    useDesktopToggleVaultNotificationMutation()
  const { mutate: toggleAll, isPending: isTogglingAll } =
    useDesktopToggleAllVaultsNotificationMutation()
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
