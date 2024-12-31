import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { Text } from '../../../lib/ui/text';
import { StartKeysignPrompt } from '../../keysign/components/StartKeysignPrompt';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useSendChainSpecificQuery } from '../queries/useSendChainSpecificQuery';
import { useCurrentSendCoin } from '../state/sendCoin';
import { useSendTxKeysignPayload } from '../state/sendTxKeysignPayload';
import { useSendTerms } from './state/sendTerms';

export const SendConfirm = () => {
  const { t } = useTranslation();
  const [coinKey] = useCurrentSendCoin();
  const coin = useCurrentVaultCoin(coinKey);
  const chainSpecificQuery = useSendChainSpecificQuery();
  const balanceQuery = useBalanceQuery(storageCoinToCoin(coin));
  const keysignPayload = useSendTxKeysignPayload();
  const [terms] = useSendTerms();

  const isDisabled = useMemo(() => {
    if (terms.some(term => !term)) {
      return t('terms_required');
    }
  }, [t, terms]);

  if (balanceQuery.error || chainSpecificQuery.error) {
    return <Text>{t('failed_to_load')}</Text>;
  }

  const isPending = balanceQuery.isPending || chainSpecificQuery.isPending;

  if (isPending) {
    return <Text>{t('loading')}</Text>;
  }

  return <StartKeysignPrompt value={keysignPayload} isDisabled={isDisabled} />;
};
