import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useValidateAddressQuery } from '../../../../chain/queries/useValidateAddressQuery';
import { fromChainAmount } from '../../../../chain/utils/fromChainAmount';
import { useBalanceQuery } from '../../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../../coin/utils/storageCoin';
import { useCurrentVaultCoin } from '../../../state/currentVault';
import { useSendAmount } from '../../state/amount';
import { useSendReceiver } from '../../state/receiver';
import { useCurrentSendCoin } from '../../state/sendCoin';

export const useIsSendFormDisabled = () => {
  const [receiver] = useSendReceiver();
  const [amount] = useSendAmount();
  const [coinKey] = useCurrentSendCoin();

  const { t } = useTranslation();
  const coin = useCurrentVaultCoin(coinKey);
  const balanceQuery = useBalanceQuery(storageCoinToCoin(coin));

  const addressValidationQuery = useValidateAddressQuery({
    address: receiver,
    chain: coinKey.chain,
  });

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
    t,
  ]);
};
