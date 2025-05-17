import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { QrCodeIcon } from '@lib/ui/icons/QrCodeIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { PageHeaderIconButtons } from '@lib/ui/page/PageHeaderIconButtons'
import { PageHeaderToggleTitle } from '@lib/ui/page/PageHeaderToggleTitle'
import styled from 'styled-components'

import UpdateAvailablePopup from '../../components/updateAvailablePopup/UpdateAvailablePopup'
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { RefreshVaultBalance } from '../../vault/balance/RefreshVaultBalance'
import { VaultOverview } from '../../vault/components/VaultOverview'
import { ProvideQrPrompt } from '../../vault/qr/ProvideQrPrompt'

export const VaultPage = () => {
  const { name } = useCurrentVault()
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

        <PositionQrPrompt>
          <ProvideQrPrompt />
        </PositionQrPrompt>
        <VaultOverview />
      </VStack>
      <UpdateAvailablePopup />
    </>
  )
}

const PositionQrPrompt = styled.div`
  position: fixed;
  bottom: ${toSizeUnit(pageConfig.verticalPadding)};
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  z-index: 1;
`
