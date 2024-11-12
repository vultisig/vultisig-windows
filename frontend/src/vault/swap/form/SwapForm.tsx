import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '../../../lib/ui/buttons/Button';
import { getFormProps } from '../../../lib/ui/form/utils/getFormProps';
import { VStack } from '../../../lib/ui/layout/Stack';
import { ComponentWithForwardActionProps } from '../../../lib/ui/props';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { convertChainSymbolToChain } from '../../../utils/crypto';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import { useCurrentVaultAddreses } from '../../state/currentVault';
import { ManageAmount } from '../amount/ManageSendAmount';
import { ManageSwapCoin } from '../coin/ManageSwapCoin';
import { ManageSwapCoinTo } from '../coin/ManageSwapCoinTo';
import { SendFee } from '../fee/SendFee';
import { SendFiatFee } from '../fee/SendFiatFee';
import { StrictFeeRow } from '../fee/StrictFeeRow';
import SwapQuotes from '../quotes/SwapQuotes';
import { useCoinTo } from '../state/coin-to';
import { useSendReceiver } from '../state/receiver';
import { useIsSendFormDisabled } from './hooks/useIsSendFormDisabled';

export const SwapForm = ({ onForward }: ComponentWithForwardActionProps) => {
  const { t } = useTranslation();
  const [, setValue] = useSendReceiver();

  const isDisabled = useIsSendFormDisabled();

  const addresses = useCurrentVaultAddreses();
  const [coinTo] = useCoinTo();

  useEffect(() => {
    setValue(
      addresses[
        convertChainSymbolToChain(coinTo?.chain || '') as keyof typeof addresses
      ] || ''
    );
  }, [addresses, coinTo, setValue]);

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>Swap</PageHeaderTitle>}
      />
      <PageContent
        as="form"
        gap={40}
        {...getFormProps({
          onSubmit: onForward,
          isDisabled,
        })}
      >
        <WithProgressIndicator value={0.2}>
          <VStack gap={16}>
            <ManageSwapCoin />
            <ManageSwapCoinTo />
            <ManageAmount />
            <SwapQuotes />
            <VStack gap={8}>
              <StrictFeeRow>
                <SendFee />
              </StrictFeeRow>
              <StrictFeeRow>
                <SendFiatFee />
              </StrictFeeRow>
            </VStack>
          </VStack>
        </WithProgressIndicator>
        <Button isDisabled={isDisabled} type="submit">
          {t('continue')}
        </Button>
      </PageContent>
    </>
  );
};
