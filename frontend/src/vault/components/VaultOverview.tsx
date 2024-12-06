import styled from 'styled-components';

import VaultBackupBanner from '../../components/vaultBackupBanner/VaultBackupBanner/VaultBackupBanner';
import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller';
import { VStack } from '../../lib/ui/layout/Stack';
import { PageContent } from '../../ui/page/PageContent';
import { VaultTotalBalance } from '../balance/VaultTotalBalance';
import { ManageVaultChainsPrompt } from '../chain/manage/ManageVaultChainsPrompt';
import { useVaultChainsBalancesQuery } from '../queries/useVaultChainsBalancesQuery';
import { useCurrentVault } from '../state/currentVault';
import { VaultChainItem } from './VaultChainItem';
import { VaultPrimaryActions } from './VaultPrimaryActions';

const VaultBannerWrapper = styled.div`
  padding-inline: 20px;
  margin-top: 12px;
`;

export const VaultOverview = () => {
  const { data: vaultChainBalances = [] } = useVaultChainsBalancesQuery();
  const vault = useCurrentVault();

  return (
    <ScrollableFlexboxFiller>
      {!vault?.is_backed_up && (
        <VaultBannerWrapper>
          <VaultBackupBanner />
        </VaultBannerWrapper>
      )}
      <PageContent>
        <VStack gap={32}>
          <VStack gap={24} alignItems="center">
            <VaultTotalBalance />
            <VaultPrimaryActions />
          </VStack>
          <VStack gap={16}>
            {vaultChainBalances.map(vaultChainBalance => (
              <VaultChainItem
                key={vaultChainBalance.chain}
                vault={vaultChainBalance}
              />
            ))}
            <ManageVaultChainsPrompt />
          </VStack>
        </VStack>
      </PageContent>
    </ScrollableFlexboxFiller>
  );
};
