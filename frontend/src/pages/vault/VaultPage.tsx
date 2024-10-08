import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import VaultBackupBanner from '../../components/vaultBackupBanner/VaultBackupBanner';
import { VaultList } from '../../components/vaultList/VaultList';
import { Match } from '../../lib/ui/base/Match';
import { toSizeUnit } from '../../lib/ui/css/toSizeUnit';
import { MenuIcon } from '../../lib/ui/icons/MenuIcon';
import { QrCodeIcon } from '../../lib/ui/icons/QrCodeIcon';
import { VStack } from '../../lib/ui/layout/Stack';
import { match } from '../../lib/utils/match';
import { makeAppPath } from '../../navigation';
import { pageConfig } from '../../ui/page/config';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton';
import { PageHeaderIconButtons } from '../../ui/page/PageHeaderIconButtons';
import { PageHeaderToggleTitle } from '../../ui/page/PageHeaderToggleTitle';
import { RefreshVaultBalance } from '../../vault/balance/RefreshVaultBalance';
import { VaultOverview } from '../../vault/components/VaultOverview';
import { ProvideQrPrompt } from '../../vault/qr/ProvideQrPrompt';
import { useAssertCurrentVault } from '../../vault/state/useCurrentVault';

type VaultPageView = 'balances' | 'vaults';

const PositionQrPrompt = styled.div`
  position: fixed;
  bottom: ${toSizeUnit(pageConfig.verticalPadding)};
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  z-index: 1;
`;

export const VaultPage = () => {
  const [view, setView] = useState<VaultPageView>('balances');
  const navigate = useNavigate();
  const selectedVault = useAssertCurrentVault();
  const { t } = useTranslation();

  return (
    <VStack flexGrow data-testid="VaultPage-Container">
      <PageHeader
        hasBorder
        primaryControls={
          <PageHeaderIconButton
            onClick={() => navigate(makeAppPath('vaultSettings'))}
            icon={<MenuIcon />}
          />
        }
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
            value={view === 'vaults'}
            onChange={value => setView(value ? 'vaults' : 'balances')}
          >
            {match(view, {
              balances: () => selectedVault.name,
              vaults: () => t('vaults'),
            })}
          </PageHeaderToggleTitle>
        }
      />

      <VStack flexGrow data-testid="VaultPage-Content">
        {!selectedVault.is_backed_up && <VaultBackupBanner />}
        <Match
          value={view}
          balances={() => (
            <>
              <PositionQrPrompt data-testid="VaultPage-Content-PositionQrPrompt">
                <ProvideQrPrompt />
              </PositionQrPrompt>
              <VaultOverview />
            </>
          )}
          vaults={() => (
            <VaultList
              onFinish={() => {
                setView('balances');
              }}
            />
          )}
        />
      </VStack>
    </VStack>
  );
};
