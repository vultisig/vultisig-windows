import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { Button } from '../../../lib/ui/buttons/Button';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Text } from '../../../lib/ui/text';
import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import {
  useCurrentVaultCoin,
  useCurrentVaultHasServer,
} from '../../state/currentVault';
import { useSpecificSendTxInfoQuery } from '../queries/useSpecificSendTxInfoQuery';
import { useCurrentSendCoin } from '../state/sendCoin';
import { useSendTxKeysignPayload } from '../state/sendTxKeysignPayload';
import { useSendTerms } from './state/sendTerms';

export const SendConfirm = () => {
  const { t } = useTranslation();

  const [coinKey] = useCurrentSendCoin();
  const coin = useCurrentVaultCoin(coinKey);

  const navigate = useAppNavigate();

  const specificTxInfoQuery = useSpecificSendTxInfoQuery();
  const balanceQuery = useBalanceQuery(storageCoinToCoin(coin));

  const keysignPayload = useSendTxKeysignPayload();

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
        <Button
          onClick={() => {
            navigate('fastKeysign', {
              state: {
                keysignPayload,
              },
            });
          }}
          isDisabled={isDisabled}
        >
          {t('fast_sign')}
        </Button>
        <Button
          kind="outlined"
          isDisabled={isDisabled}
          onClick={() => {
            navigate('keysign', {
              state: {
                keysignPayload,
              },
            });
          }}
        >
          {t('paired_sign')}
        </Button>
      </VStack>
    );
  }

  return (
    <Button
      isDisabled={isDisabled}
      onClick={() => {
        navigate('keysign', {
          state: {
            keysignPayload,
          },
        });
      }}
    >
      {t('continue')}
    </Button>
  );
};
