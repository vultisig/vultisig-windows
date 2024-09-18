import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller';
import { VStack } from '../../lib/ui/layout/Stack';
import { PageContent } from '../../ui/page/PageContent';
import { VaultTotalBalance } from '../balance/VaultTotalBalance';
import { ManageVaultChainsPrompt } from '../chain/manage/ManageVaultChainsPrompt';
import { useVaultChainsBalancesQuery } from '../queries/useVaultChainsBalancesQuery';
import { VaultChainItem } from './VaultChainItem';
import { VaultPrimaryActions } from './VaultPrimaryActions';

export const VaultOverview = () => {
  const { data: vaults = [] } = useVaultChainsBalancesQuery();

  return (
    <ScrollableFlexboxFiller>
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
