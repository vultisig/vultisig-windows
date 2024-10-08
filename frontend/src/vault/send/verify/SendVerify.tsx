import { useTranslation } from 'react-i18next';

import { TxOverviewAddress } from '../../../chain/tx/components/TxOverviewAddress';
import { TxOverviewAmount } from '../../../chain/tx/components/TxOverviewAmount';
import { TxOverviewPanel } from '../../../chain/tx/components/TxOverviewPanel';
import { TxOverviewRow } from '../../../chain/tx/components/TxOverviewRow';
import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import {
  useAssertCurrentVaultAddress,
  useAssertCurrentVaultCoin,
} from '../../state/useCurrentVault';
import { SendNetworkFeeValue } from '../fee/SendNetworkFeeValue';
import { useSendAmount } from '../state/amount';
import { useSendReceiver } from '../state/receiver';
import { useCurrentSendCoin } from '../state/sendCoin';

export const SendVerify: React.FC<
  ComponentWithForwardActionProps & ComponentWithBackActionProps
> = ({ onBack, onForward }) => {
  const { t } = useTranslation();

  const [coinKey] = useCurrentSendCoin();
  const address = useAssertCurrentVaultAddress(coinKey.chainId);
  const coin = useAssertCurrentVaultCoin(coinKey);
  const [receiver] = useSendReceiver();
  const [amount] = useSendAmount();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={<PageHeaderTitle>{t('verify')}</PageHeaderTitle>}
      />
      <PageContent
        as="form"
        gap={40}
        {...getFormProps({
          onSubmit: onForward,
        })}
      >
        <WithProgressIndicator value={0.3}>
          <TxOverviewPanel>
            <TxOverviewAddress title={t('from')} value={address} />
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
        <Button type="submit">{t('continue')}</Button>
      </PageContent>
    </>
  );
};
