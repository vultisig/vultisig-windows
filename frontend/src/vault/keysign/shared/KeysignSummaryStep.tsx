import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { TxOverviewPanel } from '../../../chain/tx/components/TxOverviewPanel';
import { Button } from '../../../lib/ui/buttons/Button';
import { makeAppPath } from '../../../navigation';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { KeysignTxOverview } from './KeysignTxOverview';
import { WithProgressIndicator } from './WithProgressIndicator';

export const KeysignSummaryStep = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader title={<PageHeaderTitle>{t('done')}</PageHeaderTitle>} />
      <PageContent>
        <WithProgressIndicator value={1}>
          <TxOverviewPanel>
            <KeysignTxOverview />
          </TxOverviewPanel>
        </WithProgressIndicator>
        <Link to={makeAppPath('vault')}>
          <Button as="div">{t('complete')}</Button>
        </Link>
      </PageContent>
    </>
  );
};
