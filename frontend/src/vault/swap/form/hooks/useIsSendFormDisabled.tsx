import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useValidateAddressQuery } from '../../../../chain/queries/useValidateAddressQuery';
import { formatFee } from '../../../../chain/tx/fee/utils/formatFee';
import { fromChainAmount } from '../../../../chain/utils/fromChainAmount';
import { useBalanceQuery } from '../../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../../coin/utils/storageCoin';
import { Chain } from '../../../../model/chain';
import {
  useCurrentVaultCoin,
  useCurrentVaultNativeCoin,
} from '../../../state/currentVault';
import { useSendSpecificTxInfo } from '../../fee/SendSpecificTxInfoProvider';
import { useSwapAmount } from '../../state/amount';
import { useCoinTo } from '../../state/coin-to';
import { useSendReceiver } from '../../state/receiver';
import { useCurrentSwapCoin } from '../../state/swapCoin';

export const useIsSendFormDisabled = () => {
  const [receiver] = useSendReceiver();
  const [amount] = useSwapAmount();
  const [coinTo] = useCoinTo();
  const [coinKey] = useCurrentSwapCoin();
  const txInfo = useSendSpecificTxInfo();

  const addressValidationQuery = useValidateAddressQuery({
    address: receiver,
    chainId: coinTo?.chain as Chain,
  });

  const { t } = useTranslation();

  const coin = useCurrentVaultCoin(coinKey);
  const nativeCoin = useCurrentVaultNativeCoin(coin.chain);
  const balanceQuery = useBalanceQuery(storageCoinToCoin(coin));
  const nativeBalanceQuery = useBalanceQuery(storageCoinToCoin(nativeCoin));
  console.log(nativeBalanceQuery);
  console.log(txInfo);
  console.log(formatFee({ chain: Chain.Avalanche, txInfo }));

  return useMemo(() => {
    if (addressValidationQuery.isPending || balanceQuery.isPending) {
      return t('send_pending_validation');
    }

    if (!receiver) {
      return t('swap_invalid_receiver');
    }

    if (nativeBalanceQuery.data) {
      if (
        new BigNumber(txInfo.fee).isGreaterThan(nativeBalanceQuery.data.amount)
      ) {
        return t('insufficient_funds_to_pay_fee');
      }
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
    nativeBalanceQuery.data,
    receiver,
    t,
    txInfo.fee,
  ]);
};
