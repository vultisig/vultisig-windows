import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import UpdateAvailablePopup from '../../components/updateAvailablePopup/UpdateAvailablePopup'
import { Button } from '../../lib/ui/buttons/Button'
import { toSizeUnit } from '../../lib/ui/css/toSizeUnit'
import { QrCodeIcon } from '../../lib/ui/icons/QrCodeIcon'
import { VStack } from '../../lib/ui/layout/Stack'
import { makeAppPath } from '../../navigation'
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'
import { PageHeaderVaultSettingsPrompt } from '../../pages/vaultSettings/PageHeaderVaultSettingsPrompt'
import { pageConfig } from '../../ui/page/config'
import { PageHeader } from '../../ui/page/PageHeader'
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton'
import { PageHeaderIconButtons } from '../../ui/page/PageHeaderIconButtons'
import { PageHeaderToggleTitle } from '../../ui/page/PageHeaderToggleTitle'
import { RefreshVaultBalance } from '../../vault/balance/RefreshVaultBalance'
import { VaultOverview } from '../../vault/components/VaultOverview'
import { ProvideQrPrompt } from '../../vault/qr/ProvideQrPrompt'
import { useCurrentVault } from '../state/currentVault'

const RiveWrapper = styled.div`
  position: absolute;
  inset: 0;
  margin: auto;
  width: 500px;
  height: 500px;
`

export const VaultPage = () => {
  const navigate = useAppNavigate()
  const { name } = useCurrentVault()
  const { rive, RiveComponent } = useRive({
    src: '/assets/animations/secure-vault-overview-2-of-3/2of3_securevault_overview.riv',
    autoplay: true,
    stateMachines: 'State Machine 1',
  })

  console.log('## rive', rive)

  const input = useStateMachineInput(rive, 'State Machine 1', 'Index')
  console.log('## input', input)

  return (
    <RiveWrapper>
      <RiveComponent />
      <Button
        onClick={() => {
          console.log('## input', input.value)

          if (
            !input ||
            input.value === undefined ||
            typeof input.value !== 'number'
          )
            return
          input.value += 1
        }}
      >
        Next
      </Button>
    </RiveWrapper>
  )

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
