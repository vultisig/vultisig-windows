import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '../../../lib/ui/buttons/Button';
import { SeparatedByLine } from '../../../lib/ui/layout/SeparatedByLine';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Panel } from '../../../lib/ui/panel/Panel';
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
        <VStack flexGrow>
          <WithProgressIndicator value={1}>
            <Panel>
              <SeparatedByLine gap={12}>
                <JoinKeysignTxOverview />
                <JoinKeysignTxPrimaryInfo />
              </SeparatedByLine>
            </Panel>
          </WithProgressIndicator>
        </VStack>
        <Link to={makeAppPath('vaultList')}>
          <Button as="div">{t('continue')}</Button>
        </Link>
      </PageContent>
    </>
  );
};
