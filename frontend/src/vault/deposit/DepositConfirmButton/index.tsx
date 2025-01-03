import { useTranslation } from 'react-i18next';

import { toChainAmount } from '../../../chain/utils/toChainAmount';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { Button } from '../../../lib/ui/buttons/Button';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { isOneOf } from '../../../lib/utils/array/isOneOf';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import {
  useCurrentVault,
  useCurrentVaultCoin,
  useVaultServerStatus,
} from '../../state/currentVault';
import { ChainAction } from '../ChainAction';
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin';
import { useDepositChainSpecificQuery } from '../queries/useDepositChainSpecificQuery';
import { transactionConfig } from './config';

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
  const coin = useCurrentVaultCoin(coinKey);
  const navigate = useAppNavigate();
  const chainSpecificQuery = useDepositChainSpecificQuery();
  const balanceQuery = useBalanceQuery(storageCoinToCoin(coin));

  const vault = useCurrentVault();

  const config = transactionConfig[action] || {};
  const receiver = config.requiresNodeAddress
    ? (depositFormData['nodeAddress'] as string)
    : '';

  const amount = config.requiresAmount
    ? (depositFormData['amount'] as number)
    : config.defaultAmount || 0;

  const memo = (depositFormData['memo'] as string) ?? '';

  const startKeysign = (type: DepositType) => {
    // TODO: handle affiliate fee and percentage
    const keysignPayload = new KeysignPayload({
      coin: storageCoinToCoin(coin),
      memo,
      blockchainSpecific: shouldBePresent(chainSpecificQuery.data),
      vaultLocalPartyId: vault.local_party_id,
      vaultPublicKeyEcdsa: vault.public_key_ecdsa,
    });

    if (isOneOf(action, ['unstake', 'leave', 'unbound', 'stake', 'bond'])) {
      keysignPayload.toAddress = shouldBePresent(receiver);
    }

    if (!isOneOf(action, ['vote', 'withdrawPool'])) {
      keysignPayload.toAmount = toChainAmount(
        shouldBePresent(amount),
        coin.decimals
      ).toString();
    }

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

  if (balanceQuery.error || chainSpecificQuery.error) {
    return <Text>{t('failed_to_load')}</Text>;
  }

  const isPending = balanceQuery.isPending || chainSpecificQuery.isPending;

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
