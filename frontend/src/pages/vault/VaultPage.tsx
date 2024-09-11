import { useState } from 'react';
import { VaultList } from '../../components/vaultList/VaultList';
import { Match } from '../../lib/ui/base/Match';
import { useTranslation } from 'react-i18next';
import { match } from '../../lib/utils/match';
import styled from 'styled-components';
import { ProvideQrPrompt } from '../../vault/qr/ProvideQrPrompt';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderIconButton } from '../../ui/page/PageHeaderIconButton';
import { MenuIcon } from '../../lib/ui/icons/MenuIcon';
import { PageHeaderToggleTitle } from '../../ui/page/PageHeaderToggleTitle';
import { VStack } from '../../lib/ui/layout/Stack';
import { toSizeUnit } from '../../lib/ui/css/toSizeUnit';
import { pageConfig } from '../../ui/page/config';
import { PageHeaderIconButtons } from '../../ui/page/PageHeaderIconButtons';
import { QrCodeIcon } from '../../lib/ui/icons/QrCodeIcon';
import { useAssertCurrentVault } from '../../vault/state/useCurrentVault';
import { VaultOverview } from '../../vault/components/VaultOverview';
import { RefreshVaultBalance } from '../../vault/balance/RefreshVaultBalance';
import { useNavigate } from 'react-router-dom';

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
    <VStack fill data-testid="VaultPage-Container">
      <PageHeader
        hasBorder
        primaryControls={
          <PageHeaderIconButton
            onClick={() => navigate('/vault/settings')}
            icon={<MenuIcon />}
          />
        }
        secondaryControls={
          <PageHeaderIconButtons>
            <PageHeaderIconButton icon={<QrCodeIcon />} />
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

      <VStack fill>
        <Match
          value={view}
          balances={() => (
            <>
              <PositionQrPrompt>
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
