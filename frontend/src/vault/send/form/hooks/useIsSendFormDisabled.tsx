import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useValidateAddressQuery } from '../../../../chain/queries/useValidateAddressQuery';
import { fromChainAmount } from '../../../../chain/utils/fromChainAmount';
import { useBalanceQuery } from '../../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../../coin/utils/storageCoin';
import { useAssertCurrentVaultCoin } from '../../../state/useCurrentVault';
import { useSender } from '../../sender/hooks/useSender';
import { useSendAmount } from '../../state/amount';
import { useSendReceiver } from '../../state/receiver';
import { useCurrentSendCoin } from '../../state/sendCoin';

export const useIsSendFormDisabled = () => {
  const sender = useSender();
  const [receiver] = useSendReceiver();
  const [amount] = useSendAmount();

  const [coinKey] = useCurrentSendCoin();

  const addressValidationQuery = useValidateAddressQuery({
    address: receiver,
    chainId: coinKey.chainId,
  });

  const { t } = useTranslation();

  const coin = useAssertCurrentVaultCoin(coinKey);
  const balanceQuery = useBalanceQuery(storageCoinToCoin(coin));

  return useMemo(() => {
    if (addressValidationQuery.isPending || balanceQuery.isPending) {
      return t('send_pending_validation');
    }

    if (
      addressValidationQuery.data === undefined ||
      balanceQuery.data === undefined
    ) {
      return t('send_validation_failed');
    }

    const addressError = addressValidationQuery.data;
    if (addressError) {
      return t('send_invalid_receiver_address');
    }

    if (receiver === sender) {
      return t('same_sender_receiver_error');
    }

    if (!amount) {
      return t('amount_required');
    }

    const { amount: maxChainAmount, decimals } = balanceQuery.data;
    const maxAmount = fromChainAmount(maxChainAmount, decimals);

    if (amount > maxAmount) {
      return t('send_amount_exceeds_balance');
    }
  }, [
    addressValidationQuery.data,
    addressValidationQuery.isPending,
    amount,
    balanceQuery.data,
    balanceQuery.isPending,
    receiver,
    sender,
    t,
  ]);
};
