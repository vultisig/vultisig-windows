import { DesktopNotificationPrompt } from '@clients/desktop/src/notifications/DesktopNotificationPrompt'
import { useVaults } from '@core/ui/storage/vaults'
import { VaultPage } from '@core/ui/vault/page'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { useEffect } from 'react'

export const DesktopVaultPage = () => {
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
      <DesktopNotificationPrompt />
      <VaultPage />
    </>
  )
}
