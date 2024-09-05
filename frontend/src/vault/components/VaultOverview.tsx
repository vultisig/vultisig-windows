import { ScrollableFlexboxFiller } from '../../lib/ui/layout/ScrollableFlexboxFiller';
import { VStack } from '../../lib/ui/layout/Stack';
import { PageContent } from '../../ui/page/PageContent';
import { VaultPrimaryActions } from './VaultPrimaryActions';
import { VaultTotalBalance } from '../balance/VaultTotalBalance';
import { ManageVaultChainsPrompt } from '../chain/manage/ManageVaultChainsPrompt';
import { VaultChainItem } from './VaultChainItem';
import { useAssertCurrentVaultChainIds } from '../state/useCurrentVault';

export const VaultOverview = () => {
  const chains = useAssertCurrentVaultChainIds();

  return (
    <ScrollableFlexboxFiller>
      <PageContent>
        <VStack gap={32}>
          <VStack gap={24} alignItems="center">
            <VaultTotalBalance />
            <VaultPrimaryActions />
          </VStack>
          <VStack gap={16}>
            {chains.map(chainId => (
              <VaultChainItem key={chainId} value={chainId} />
            ))}
            <ManageVaultChainsPrompt />
          </VStack>
        </VStack>
      </PageContent>
    </ScrollableFlexboxFiller>
  );
};
