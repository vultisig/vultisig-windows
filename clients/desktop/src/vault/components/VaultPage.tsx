import { hasServer } from '@core/mpc/devices/localPartyId'
import { FastVaultPasswordVerification } from '@core/ui/mpc/fast/FastVaultPasswordVerification'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { QrCodeIcon } from '@lib/ui/icons/QrCodeIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderIconButtons } from '@lib/ui/page/PageHeaderIconButtons'
import { PageHeaderToggleTitle } from '@lib/ui/page/PageHeaderToggleTitle'

import UpdateAvailablePopup from '../../components/updateAvailablePopup/UpdateAvailablePopup'
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { RefreshVaultBalance } from '../../vault/balance/RefreshVaultBalance'
import { VaultOverview } from '../../vault/components/VaultOverview'
import { UploadQrPrompt } from './UploadQrPrompt'

export const VaultPage = () => {
  const vault = useCurrentVault()
  const { name, signers } = vault
  const isFastVault = hasServer(signers)
  const navigate = useAppNavigate()
  const vaultId = getVaultId(vault)

  return (
    <>
      <VStack flexGrow>
        <PageHeader
          hasBorder
          primaryControls={
            <PageHeaderIconButton
              onClick={() => navigate({ id: 'settings' })}
              icon={<MenuIcon />}
            />
          }
          secondaryControls={
            <PageHeaderIconButtons>
              <PageHeaderIconButton
                icon={<QrCodeIcon />}
                onClick={() => navigate({ id: 'shareVault' })}
              />
              <RefreshVaultBalance />
            </PageHeaderIconButtons>
          }
          title={
            <PageHeaderToggleTitle
              value={false}
              onChange={() => {
                navigate({ id: 'vaults' })
              }}
            >
              {name}
            </PageHeaderToggleTitle>
          }
        />

        <UploadQrPrompt />
        <VaultOverview />
      </VStack>
      <UpdateAvailablePopup />
      {isFastVault && <FastVaultPasswordVerification key={vaultId} />}
    </>
  )
}
