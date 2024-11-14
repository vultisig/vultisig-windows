import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { Button } from '../../../lib/ui/buttons/Button';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { ISendTransaction, TransactionType } from '../../../model/transaction';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { BlockchainServiceFactory } from '../../../services/Blockchain/BlockchainServiceFactory';
import {
  useCurrentVault,
  useCurrentVaultCoin,
  useCurrentVaultHasServer,
} from '../../state/currentVault';
import { useSpecificSendTxInfoQuery } from '../queries/useSpecificSendTxInfoQuery';
import { useSender } from '../sender/hooks/useSender';
import { useSendAmount } from '../state/amount';
import { useSendMemo } from '../state/memo';
import { useSendReceiver } from '../state/receiver';
import { useCurrentSendCoin } from '../state/sendCoin';
import { useSendTerms } from './state/sendTerms';

type SendType = 'fast' | 'paired';

export const SendConfirm = () => {
  const { t } = useTranslation();

  const [coinKey] = useCurrentSendCoin();
  const sender = useSender();
  const coin = useCurrentVaultCoin(coinKey);
  const [receiver] = useSendReceiver();
  const [amount] = useSendAmount();
  const [memo] = useSendMemo();
  const vault = useCurrentVault();

  const navigate = useAppNavigate();

  const walletCore = useAssertWalletCore();

  const specificTxInfoQuery = useSpecificSendTxInfoQuery();
  const balanceQuery = useBalanceQuery(storageCoinToCoin(coin));

  const startKeysign = (type: SendType) => {
    const balance = shouldBePresent(balanceQuery.data);
    const isMaxAmount =
      amount === fromChainAmount(balance.amount, coin.decimals);

    const tx: ISendTransaction = {
      fromAddress: sender,
      toAddress: receiver,
      amount: shouldBePresent(amount),
      memo,
      coin: storageCoinToCoin(coin),
      transactionType: TransactionType.SEND,
      specificTransactionInfo: shouldBePresent(specificTxInfoQuery.data),
      sendMaxAmount: isMaxAmount,
    };

    const keysignPayload = BlockchainServiceFactory.createService(
      coinKey.chainId,
      walletCore
    ).createKeysignPayload(tx, vault.local_party_id, vault.public_key_ecdsa);

    navigate(type === 'fast' ? 'fastKeysign' : 'keysign', {
      state: { keysignPayload },
    });
  };

  const [terms] = useSendTerms();
  const isDisabled = useMemo(() => {
    if (terms.some(term => !term)) {
      return t('send_terms_error');
    }
  }, [t, terms]);

  const hasServer = useCurrentVaultHasServer();

  if (balanceQuery.error || specificTxInfoQuery.error) {
    return <Text>{t('failed_to_load')}</Text>;
  }

  const isPending = balanceQuery.isPending || specificTxInfoQuery.isPending;

  if (isPending) {
    return <Text>{t('loading')}</Text>;
  }

  if (hasServer) {
    return (
      <VStack gap={20}>
        <Button onClick={() => startKeysign('fast')} isDisabled={isDisabled}>
          {t('fast_sign')}
        </Button>
        <Button
          kind="outlined"
          isDisabled={isDisabled}
          onClick={() => startKeysign('paired')}
        >
          {t('paired_sign')}
        </Button>
      </VStack>
    );
  }

  return (
    <Button isDisabled={isDisabled} onClick={() => startKeysign('paired')}>
      {t('continue')}
    </Button>
  );
};
