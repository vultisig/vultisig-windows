import { Link } from 'react-router-dom';
import styled from 'styled-components';

import UpdateAvailablePopup from '../../components/updateAvailablePopup/UpdateAvailablePopup';
import { toSizeUnit } from '../../lib/ui/css/toSizeUnit';
import { QrCodeIcon } from '../../lib/ui/icons/QrCodeIcon';
import { VStack } from '../../lib/ui/layout/Stack';
import { makeAppPath } from '../../navigation';
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate';
import { PageHeaderVaultSettingsPrompt } from '../../pages/vaultSettings/PageHeaderVaultSettingsPrompt';
import { pageConfig } from '../../ui/page/config';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton';
import { PageHeaderIconButtons } from '../../ui/page/PageHeaderIconButtons';
import { PageHeaderToggleTitle } from '../../ui/page/PageHeaderToggleTitle';
import { RefreshVaultBalance } from '../../vault/balance/RefreshVaultBalance';
import { VaultOverview } from '../../vault/components/VaultOverview';
import { ProvideQrPrompt } from '../../vault/qr/ProvideQrPrompt';
import { useCurrentVault } from '../state/currentVault';

const PositionQrPrompt = styled.div`
  position: fixed;
  bottom: ${toSizeUnit(pageConfig.verticalPadding)};
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  z-index: 1;
`;

export const VaultPage = () => {
  const navigate = useAppNavigate();
  const { name } = useCurrentVault();

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
                navigate('vaults');
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
  );
};
