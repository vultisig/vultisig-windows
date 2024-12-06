import { useTranslation } from 'react-i18next';

import { TxOverviewAmount } from '../../../chain/tx/components/TxOverviewAmount';
import { TxOverviewMemo } from '../../../chain/tx/components/TxOverviewMemo';
import { TxOverviewPanel } from '../../../chain/tx/components/TxOverviewPanel';
import { TxOverviewPrimaryRow } from '../../../chain/tx/components/TxOverviewPrimaryRow';
import { TxOverviewRow } from '../../../chain/tx/components/TxOverviewRow';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithBackActionProps } from '../../../lib/ui/props';
import { range } from '../../../lib/utils/array/range';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { SendFee } from '../fee/SendFee';
import { SendFiatFee } from '../fee/SendFiatFee';
import { useSender } from '../sender/hooks/useSender';
import { useSendAmount } from '../state/amount';
import { useSendMemo } from '../state/memo';
import { useSendReceiver } from '../state/receiver';
import { useCurrentSendCoin } from '../state/sendCoin';
import { SendConfirm } from './SendConfirm';
import { SendTerms } from './SendTerms';
import { sendTermsCount, SendTermsProvider } from './state/sendTerms';

export const SendVerify: React.FC<ComponentWithBackActionProps> = ({
  onBack,
}) => {
  const { t } = useTranslation();
  const [coinKey] = useCurrentSendCoin();
  const sender = useSender();
  const coin = useCurrentVaultCoin(coinKey);
  const [receiver] = useSendReceiver();
  const [amount] = useSendAmount();
  const [memo] = useSendMemo();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={<PageHeaderTitle>{t('verify')}</PageHeaderTitle>}
      />
      <PageContent gap={40}>
        <WithProgressIndicator value={0.3}>
          <TxOverviewPanel>
            <TxOverviewPrimaryRow title={t('from')}>
              {sender}
            </TxOverviewPrimaryRow>
            <TxOverviewPrimaryRow title={t('to')}>
              {receiver}
            </TxOverviewPrimaryRow>
            {memo && <TxOverviewMemo value={memo} />}

            <TxOverviewAmount
              value={shouldBePresent(amount)}
              ticker={coin.ticker}
            />
            <TxOverviewRow>
              <SendFee />
            </TxOverviewRow>
            <TxOverviewRow>
              <SendFiatFee />
            </TxOverviewRow>
          </TxOverviewPanel>
        </WithProgressIndicator>
        <SendTermsProvider
          initialValue={range(sendTermsCount).map(() => false)}
        >
          <VStack gap={20}>
            <SendTerms />
            <SendConfirm />
          </VStack>
        </SendTermsProvider>
      </PageContent>
    </>
  );
};
