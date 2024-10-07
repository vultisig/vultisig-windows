import { useTranslation } from 'react-i18next';

import { PageContent } from '../../ui/page/PageContent';
import { PageHeader } from '../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../ui/page/PageHeaderTitle';
import { useInitialSendCoin } from './state/initialSendCoin';

export const SendPage = () => {
  const { t } = useTranslation();
  const coin = useInitialSendCoin();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('send')}</PageHeaderTitle>}
      />
      <PageContent>
        <code>
          {coin ? `Send ${coin.chainId}:${coin.id}` : 'Select a coin'}
        </code>
      </PageContent>
    </>
  );
};
