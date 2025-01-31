import { useTranslation } from 'react-i18next';

import { TxOverviewPanel } from '../../../../chain/tx/components/TxOverviewPanel';
import { Button } from '../../../../lib/ui/buttons/Button';
import { OnForwardProp } from '../../../../lib/ui/props';
import { PageContent } from '../../../../ui/page/PageContent';
import { PageHeader } from '../../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../../ui/page/PageHeaderTitle';
import { WithProgressIndicator } from '../../shared/WithProgressIndicator';
import { KeysignTxOverview } from './KeysignTxOverview';

export const JoinKeysignVerifyStep = ({ onForward }: OnForwardProp) => {
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('verify')}</PageHeaderTitle>}
      />
      <PageContent>
        <WithProgressIndicator value={0.6}>
          <TxOverviewPanel>
            <KeysignTxOverview />
          </TxOverviewPanel>
        </WithProgressIndicator>
        <Button onClick={onForward}>{t('join_keysign')}</Button>
      </PageContent>
    </>
  );
};
