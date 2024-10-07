import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { TxOverviewPanel } from '../../../chain/tx/components/TxOverviewPanel';
import { Button } from '../../../lib/ui/buttons/Button';
import { makeAppPath } from '../../../navigation';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { WithProgressIndicator } from '../shared/WithProgressIndicator';
import { JoinKeysignTxOverview } from './JoinKeysignTxOverview';
import { JoinKeysignTxPrimaryInfo } from './JoinKeysignTxPrimaryInfo';

export const JoinKeysignSummaryStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={<PageHeaderTitle>{t('verify')}</PageHeaderTitle>} />
      <PageContent>
        <WithProgressIndicator value={1}>
          <TxOverviewPanel>
            <JoinKeysignTxOverview />
            <JoinKeysignTxPrimaryInfo />
          </TxOverviewPanel>
        </WithProgressIndicator>
        <Link to={makeAppPath('vaultList')}>
          <Button as="div">{t('continue')}</Button>
        </Link>
      </PageContent>
    </>
  );
};
