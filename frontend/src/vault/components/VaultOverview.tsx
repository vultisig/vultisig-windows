import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller';
import { VStack } from '../../lib/ui/layout/Stack';
import { PageContent } from '../../ui/page/PageContent';
import { VaultPrimaryActions } from './VaultPrimaryActions';
import { VaultTotalBalance } from '../balance/VaultTotalBalance';
import { ManageVaultChainsPrompt } from '../chain/manage/ManageVaultChainsPrompt';
import { VaultChainItem } from './VaultChainItem';
import { useVaultChainsBalancesQuery } from '../queries/useVaultChainsBalancesQuery';

export const VaultOverview = () => {
  const query = useVaultChainsBalancesQuery();

  return (
    <ScrollableFlexboxFiller>
      <PageContent>
        <VStack gap={32}>
          <VStack gap={24} alignItems="center">
            <VaultTotalBalance />
            <VaultPrimaryActions />
          </VStack>
          <VStack gap={16}>
            {(query.data ?? []).map(value => (
              <VaultChainItem key={value.chainId} value={value} />
            ))}
            <ManageVaultChainsPrompt />
          </VStack>
        </VStack>
      </PageContent>
    </ScrollableFlexboxFiller>
  );
};
