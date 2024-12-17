import { useTranslation } from 'react-i18next';

import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { Button } from '../../../lib/ui/buttons/Button';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { BlockchainServiceFactory } from '../../../services/Blockchain/BlockchainServiceFactory';
import {
  useCurrentVault,
  useCurrentVaultCoin,
  useVaultServerStatus,
} from '../../state/currentVault';
import { ChainAction } from '../DepositForm/chainOptionsConfig';
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin';
import { useSender } from '../hooks/useSender';
import { useSpecificDepositTxInfoQuery } from '../queries/useSpecificDepositTxInfoQuery';
import { transactionConfig } from './config';
import { createTransaction } from './utils';

type DepositType = 'fast' | 'paired';

type DepositConfirmButtonProps = {
  depositFormData: Record<string, unknown>;
  action: ChainAction;
};

export const DepositConfirmButton = ({
  depositFormData,
  action,
}: DepositConfirmButtonProps) => {
  const { t } = useTranslation();
  const [coinKey] = useCurrentDepositCoin();
  const sender = useSender();
  const coin = useCurrentVaultCoin(coinKey);
  const vault = useCurrentVault();
  const navigate = useAppNavigate();
  const walletCore = useAssertWalletCore();
  const specificTxInfoQuery = useSpecificDepositTxInfoQuery();
  const balanceQuery = useBalanceQuery(storageCoinToCoin(coin));

  const config = transactionConfig[action] || {};
  const receiver = config.requiresNodeAddress
    ? (depositFormData['nodeAddress'] as string)
    : '';

  const amount = config.requiresAmount
    ? (depositFormData['amount'] as number)
    : config.defaultAmount || 0;

  const memo = (depositFormData['memo'] as string) ?? '';

  const startKeysign = (type: DepositType) => {
    const tx = createTransaction({
      selectedChainAction: action,
      sender,
      receiver,
      amount,
      memo,
      coin: storageCoinToCoin(coin),
      affiliateFee: depositFormData.affiliateFee as number | undefined,
      percentage: depositFormData.percentage as number | undefined,
      specificTransactionInfo: specificTxInfoQuery.data,
    });

    const keysignPayload = BlockchainServiceFactory.createService(
      coinKey.chain,
      walletCore
    ).createKeysignPayload(tx, vault.local_party_id, vault.public_key_ecdsa);

    navigate(type === 'fast' ? 'fastKeysign' : 'keysign', {
      state: { keysignPayload, keysignAction: 'deposit' },
    });
  };

  const { hasServer, isBackup } = useVaultServerStatus();

  if (
    (config.requiresAmount && !amount) ||
    (config.requiresNodeAddress && !receiver)
  ) {
    return <Text>{t('required_field_missing')}</Text>;
  }

  if (balanceQuery.error || specificTxInfoQuery.error) {
    return <Text>{t('failed_to_load')}</Text>;
  }

  const isPending = balanceQuery.isPending || specificTxInfoQuery.isPending;

  if (isPending) {
    return <Text>{t('loading')}</Text>;
  }

  if (hasServer && !isBackup) {
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
