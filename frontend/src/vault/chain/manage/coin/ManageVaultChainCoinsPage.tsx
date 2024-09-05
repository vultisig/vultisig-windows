import { ScrollableFlexboxFiller } from '../../../../lib/ui/layout/ScrollableFlexboxFiller';
import { VStack } from '../../../../lib/ui/layout/Stack';
import { PageContent } from '../../../../ui/page/PageContent';
import { PageHeader } from '../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle';

export const ManageVaultChainCoinsPage = () => {
  return (
    <VStack fill>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>Choose coins</PageHeaderTitle>}
      />
      <ScrollableFlexboxFiller>
        <PageContent>
          <VStack gap={16}>Coming soon...</VStack>
        </PageContent>
      </ScrollableFlexboxFiller>
    </VStack>
  );
};
