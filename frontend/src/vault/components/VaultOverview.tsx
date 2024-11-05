import styled from 'styled-components';

import VaultBackupReminderBanner from '../../components/vaultBackupBanner/VaultBackupReminderBanner/VaultBackupReminderBanner';
import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller';
import { VStack } from '../../lib/ui/layout/Stack';
import { PageContent } from '../../ui/page/PageContent';
import { VaultTotalBalance } from '../balance/VaultTotalBalance';
import { ManageVaultChainsPrompt } from '../chain/manage/ManageVaultChainsPrompt';
import { useVaultChainsBalancesQuery } from '../queries/useVaultChainsBalancesQuery';
import { useCurrentVault } from '../state/useCurrentVault';
import { VaultChainItem } from './VaultChainItem';
import { VaultPrimaryActions } from './VaultPrimaryActions';

const VaultBannerWrapper = styled.div`
  padding-inline: 20px;
  margin-top: 12px;
`;

export const VaultOverview = () => {
  const { data: vaults = [] } = useVaultChainsBalancesQuery();
  const vault = useCurrentVault();

  console.log('## vaults', vaults);

  return (
    <ScrollableFlexboxFiller>
      {!vault?.is_backed_up && (
        <VaultBannerWrapper>
          <VaultBackupReminderBanner />
        </VaultBannerWrapper>
      )}
      <PageContent>
        <VStack gap={32}>
          <VStack gap={24} alignItems="center">
            <VaultTotalBalance />
            <VaultPrimaryActions />
          </VStack>
          <VStack gap={16}>
            {vaults.map(vault => (
              <VaultChainItem key={vault.chainId} vault={vault} />
            ))}
            <ManageVaultChainsPrompt />
          </VStack>
        </VStack>
      </PageContent>
    </ScrollableFlexboxFiller>
  );
};
