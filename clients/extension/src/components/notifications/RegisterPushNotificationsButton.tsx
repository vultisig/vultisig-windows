import { getVaultId } from '@core/mpc/vault/Vault'
import { ListItemIconWrapper } from '@core/ui/vault/settings'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { BellIcon } from '@lib/ui/icons/BellIcon'
import { ListItem } from '@lib/ui/list/item'
import { useTranslation } from 'react-i18next'

import {
  PushForceRegisterVaultMessage,
  pushForceRegisterVaultType,
} from '../../notifications/pushNotificationMessages'
import {
  removePushNotificationRegistration,
  setPushNotificationRegistration,
} from '../../notifications/pushNotificationStorage'

export const RegisterPushNotificationsButton = () => {
  const { t } = useTranslation()
  const vault = useCurrentVault()

  const handleRegister = async () => {
    const vaultId = getVaultId(vault)

    // Clear any stale local registration so the background does the full flow
    await removePushNotificationRegistration(vaultId)

    const message: PushForceRegisterVaultMessage = {
      type: pushForceRegisterVaultType,
      vault: { vaultId, localPartyId: vault.localPartyId },
    }

    const response = await chrome.runtime.sendMessage(message)
    if (response?.success) {
      await setPushNotificationRegistration(vaultId, vault.localPartyId)
      console.log(`[Vultisig Push] Registered vault ${vaultId.slice(0, 12)}...`)
    } else {
      console.error('[Vultisig Push] Registration failed:', response?.error)
    }
  }

  return (
    <ListItem
      icon={
        <ListItemIconWrapper>
          <BellIcon />
        </ListItemIconWrapper>
      }
      onClick={handleRegister}
      title={t('push_notifications')}
      hoverable
      showArrow
    />
  )
}
