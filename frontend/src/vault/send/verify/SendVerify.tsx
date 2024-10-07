import { useTranslation } from 'react-i18next';

import { TxOverviewAddress } from '../../../chain/tx/components/TxOverviewAddress';
import { TxOverviewAmount } from '../../../chain/tx/components/TxOverviewAmount';
import { TxOverviewPanel } from '../../../chain/tx/components/TxOverviewPanel';
import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { VStack } from '../../../lib/ui/layout/Stack';
import {
  ComponentWithBackActionProps,
  ComponentWithForwardActionProps,
} from '../../../lib/ui/props';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import {
  useAssertCurrentVaultAddress,
  useAssertCurrentVaultCoin,
} from '../../state/useCurrentVault';
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
        <VStack flexGrow gap={16}>
          <TxOverviewPanel>
            <TxOverviewAddress title={t('from')} value={address} />
            <TxOverviewAddress title={t('to')} value={receiver} />
            <TxOverviewAmount
              value={shouldBePresent(amount)}
              symbol={coin.ticker}
            />
          </TxOverviewPanel>
        </VStack>
        <Button type="submit">{t('continue')}</Button>
      </PageContent>
    </>
  );
};
