import { useTranslation } from 'react-i18next';

import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { ManageSendCoin } from './coin/ManageSendCoin';

export const SendPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('send')}</PageHeaderTitle>}
      />
      <PageContent>
        <ManageSendCoin />
      </PageContent>
    </>
  );
};
