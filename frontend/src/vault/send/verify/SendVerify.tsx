import { useTranslation } from 'react-i18next';

import { TxOverviewAddress } from '../../../chain/tx/components/TxOverviewAddress';
import { TxOverviewAmount } from '../../../chain/tx/components/TxOverviewAmount';
import { TxOverviewPanel } from '../../../chain/tx/components/TxOverviewPanel';
import { TxOverviewRow } from '../../../chain/tx/components/TxOverviewRow';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithBackActionProps } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { range } from '../../../lib/utils/array/range';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import { useAssertCurrentVaultCoin } from '../../state/useCurrentVault';
import { SendNetworkFeeValue } from '../fee/SendNetworkFeeValue';
import { useSender } from '../sender/hooks/useSender';
import { useSendAmount } from '../state/amount';
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
  const coin = useAssertCurrentVaultCoin(coinKey);
  const [receiver] = useSendReceiver();
  const [amount] = useSendAmount();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={<PageHeaderTitle>{t('verify')}</PageHeaderTitle>}
      />
      <PageContent gap={40}>
        <WithProgressIndicator value={0.3}>
          <TxOverviewPanel>
            <TxOverviewAddress title={t('from')} value={sender} />
            <TxOverviewAddress title={t('to')} value={receiver} />
            <TxOverviewAmount
              value={shouldBePresent(amount)}
              symbol={coin.ticker}
            />
            <TxOverviewRow>
              <Text>{t('network_fee')}</Text>
              <SendNetworkFeeValue />
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
