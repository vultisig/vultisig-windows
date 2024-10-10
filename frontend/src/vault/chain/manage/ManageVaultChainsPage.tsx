import { ScrollableFlexboxFiller } from '../../../lib/ui/layout/ScrollableFlexboxFiller';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Chain } from '../../../model/chain';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { ManageVaultChain } from './ManageVaultChain';

export const ManageVaultChainsPage = () => {
  return (
    <VStack flexGrow>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>Choose chains</PageHeaderTitle>}
      />
      <ScrollableFlexboxFiller>
        <PageContent>
          <VStack gap={16} data-testid="ManageVaultChainsPage-ChainsWrapper">
            {Object.values(Chain).map(chain => (
              <ManageVaultChain key={chain} value={chain} />
            ))}
          </VStack>
        </PageContent>
      </ScrollableFlexboxFiller>
    </VStack>
  );
};
