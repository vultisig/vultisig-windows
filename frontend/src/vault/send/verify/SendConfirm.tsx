import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { Button } from '../../../lib/ui/buttons/Button';
import { Text } from '../../../lib/ui/text';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { ISendTransaction, TransactionType } from '../../../model/transaction';
import { makeAppPath } from '../../../navigation';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { BlockchainServiceFactory } from '../../../services/Blockchain/BlockchainServiceFactory';
import {
  useAssertCurrentVault,
  useAssertCurrentVaultCoin,
} from '../../state/useCurrentVault';
import { useSpecificSendTxInfoQuery } from '../queries/useSpecificSendTxInfoQuery';
import { useSender } from '../sender/hooks/useSender';
import { useSendAmount } from '../state/amount';
import { useSendReceiver } from '../state/receiver';
import { useCurrentSendCoin } from '../state/sendCoin';
import { useSendTerms } from './state/sendTerms';

export const SendConfirm = () => {
  const { t } = useTranslation();

  const [coinKey] = useCurrentSendCoin();
  const sender = useSender();
  const coin = useAssertCurrentVaultCoin(coinKey);
  const [receiver] = useSendReceiver();
  const [amount] = useSendAmount();
  const vault = useAssertCurrentVault();

  const navigate = useNavigate();

  const walletCore = useAssertWalletCore();

  const specificTxInfoQuery = useSpecificSendTxInfoQuery();
  const balanceQuery = useBalanceQuery(storageCoinToCoin(coin));

  const onSubmit = () => {
    const balance = shouldBePresent(balanceQuery.data);
    const isMaxAmount =
      amount === fromChainAmount(balance.amount, coin.decimals);

    const tx: ISendTransaction = {
      fromAddress: sender,
      toAddress: receiver,
      amount: shouldBePresent(amount),
      memo: '',
      coin: storageCoinToCoin(coin),
      transactionType: TransactionType.SEND,
      specificTransactionInfo: shouldBePresent(specificTxInfoQuery.data),
      sendMaxAmount: isMaxAmount,
    };

    const payload = BlockchainServiceFactory.createService(
      coinKey.chainId,
      walletCore
    ).createKeysignPayload(tx, vault.local_party_id, vault.public_key_ecdsa);

    navigate(
      makeAppPath('keysign', {
        keysignPayload: JSON.stringify(payload.toJson()),
      })
    );
  };

  const [terms] = useSendTerms();
  const isDisabled = useMemo(() => {
    if (terms.some(term => !term)) {
      return t('send_terms_error');
    }
  }, [t, terms]);

  if (balanceQuery.error || specificTxInfoQuery.error) {
    return <Text>{t('failed_to_load')}</Text>;
  }

  const isPending = balanceQuery.isPending || specificTxInfoQuery.isPending;

  return (
    <Button isLoading={isPending} isDisabled={isDisabled} onClick={onSubmit}>
      {t('continue')}
    </Button>
  );
};
