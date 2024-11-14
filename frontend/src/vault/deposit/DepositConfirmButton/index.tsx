import { useTranslation } from 'react-i18next';

import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { Button } from '../../../lib/ui/buttons/Button';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import {
  IDepositTransaction,
  TransactionType,
} from '../../../model/transaction';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { BlockchainServiceFactory } from '../../../services/Blockchain/BlockchainServiceFactory';
import {
  useCurrentVault,
  useCurrentVaultCoin,
  useCurrentVaultHasServer,
} from '../../state/currentVault';
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin';
import { useSender } from '../hooks/useSender';
import { useSpecificDepositTxInfoQuery } from '../queries/useSpecificDepositTxInfoQuery';

type SendType = 'fast' | 'paired';

type DepositConfirmButtonProps = {
  depositFormData: Record<string, unknown>;
};

export const DepositConfirmButton = ({
  depositFormData,
}: DepositConfirmButtonProps) => {
  const { t } = useTranslation();

  const [coinKey] = useCurrentDepositCoin();
  const sender = useSender();
  const coin = useCurrentVaultCoin(coinKey);
  const receiver = depositFormData['nodeAddress'] as string;
  const amount = depositFormData['amount'] as number;
  const memo = depositFormData['memo'] as string;
  const vault = useCurrentVault();
  const navigate = useAppNavigate();
  const walletCore = useAssertWalletCore();
  const specificTxInfoQuery = useSpecificDepositTxInfoQuery();
  const balanceQuery = useBalanceQuery(storageCoinToCoin(coin));

  const startKeysign = (type: SendType) => {
    const tx: IDepositTransaction = {
      fromAddress: sender,
      toAddress: receiver,
      amount: shouldBePresent(amount),
      memo,
      coin: storageCoinToCoin(coin),
      transactionType: TransactionType.DEPOSIT,
      specificTransactionInfo: shouldBePresent(specificTxInfoQuery.data),
    };

    const keysignPayload = BlockchainServiceFactory.createService(
      coinKey.chainId,
      walletCore
    ).createKeysignPayload(tx, vault.local_party_id, vault.public_key_ecdsa);

    navigate(type === 'fast' ? 'fastKeysign' : 'keysign', {
      state: { keysignPayload },
    });
  };

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
        <Button onClick={() => startKeysign('fast')}>{t('fast_sign')}</Button>
        <Button kind="outlined" onClick={() => startKeysign('paired')}>
          {t('paired_sign')}
        </Button>
      </VStack>
    );
  }

  return (
    <Button onClick={() => startKeysign('paired')}>{t('continue')}</Button>
  );
};
