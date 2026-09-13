import { DappsButton } from '@clients/extension/src/components/dapps-button/DappsButton'
import { useVaults } from '@core/ui/storage/vaults'
import { VaultPage } from '@core/ui/vault/page/components/VaultPage'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { useEffect } from 'react'

import { ExtensionNotificationPrompt } from '../../components/notifications/ExtensionNotificationPrompt'

/**
 * The extension's home view. With no vaults in storage it hands over to the
 * new-vault screen instead of rendering an empty vault page.
 */
export const ExtensionVaultPage = () => {
  const vaults = useVaults()
  const navigate = useNavigate()

  useEffect(() => {
    if (vaults.length === 0) {
      navigate({ id: 'newVault' }, { replace: true })
    }
  }, [vaults.length, navigate])

  if (vaults.length === 0) return null

  return (
    <>
      <ExtensionNotificationPrompt />
      <VaultPage primaryControls={<DappsButton />} />
    </>
  )
}
