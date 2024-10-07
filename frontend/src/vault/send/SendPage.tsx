import { useTranslation } from 'react-i18next';

import { VStack } from '../../lib/ui/layout/Stack';
import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { ManageSendCoin } from './coin/ManageSendCoin';
import { Sender } from './sender/Sender';

export const SendPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('send')}</PageHeaderTitle>}
      />
      <PageContent>
        <VStack gap={16}>
          <ManageSendCoin />
          <Sender />
        </VStack>
      </PageContent>
    </>
  );
};
