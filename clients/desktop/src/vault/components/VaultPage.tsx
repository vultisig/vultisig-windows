import { hasServer } from '@core/mpc/devices/localPartyId'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
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
import { FastVaultPasswordVerification } from './FastVaultPasswordVerification'
import { UploadQrPrompt } from './UploadQrPrompt'

export const VaultPage = () => {
  const { name, signers } = useCurrentVault()
  const isFastVault = hasServer(signers)
  const navigate = useAppNavigate()

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
      {isFastVault && <FastVaultPasswordVerification />}
    </>
  )
}
