import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { QrCodeIcon } from '@lib/ui/icons/QrCodeIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderIconButton } from '@lib/ui/page/PageHeaderIconButton'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import UpdateAvailablePopup from '../../components/updateAvailablePopup/UpdateAvailablePopup'
import { makeAppPath } from '../../navigation'
import { PageHeaderVaultSettingsPrompt } from '../../pages/vaultSettings/PageHeaderVaultSettingsPrompt'
import { PageHeaderIconButtons } from '../../ui/page/PageHeaderIconButtons'
import { PageHeaderToggleTitle } from '../../ui/page/PageHeaderToggleTitle'
import { RefreshVaultBalance } from '../../vault/balance/RefreshVaultBalance'
import { VaultOverview } from '../../vault/components/VaultOverview'
import { ProvideQrPrompt } from '../../vault/qr/ProvideQrPrompt'

export const VaultPage = () => {
  const navigate = useCoreNavigate()
  const { name } = useCurrentVault()

  return (
    <>
      <VStack flexGrow data-testid="VaultPage-Container">
        <PageHeader
          hasBorder
          primaryControls={<PageHeaderVaultSettingsPrompt />}
          secondaryControls={
            <PageHeaderIconButtons>
              <Link to={makeAppPath('shareVault')}>
                <PageHeaderIconButton as="div" icon={<QrCodeIcon />} />
              </Link>
              <RefreshVaultBalance />
            </PageHeaderIconButtons>
          }
          title={
            <PageHeaderToggleTitle
              value={false}
              onChange={() => {
                navigate('vaults')
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
