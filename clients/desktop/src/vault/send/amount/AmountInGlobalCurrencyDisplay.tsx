import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { areEqualCoins } from '../../../coin/Coin';
import { useCoinPricesQuery } from '../../../coin/query/useCoinPricesQuery';
import {
  getStorageCoinKey,
  storageCoinToCoin,
} from '../../../coin/utils/storageCoin';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { TextInput } from '../../../lib/ui/inputs/TextInput';
import { HStack } from '../../../lib/ui/layout/Stack';
import { text } from '../../../lib/ui/text';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { CoinMeta } from '../../../model/coin-meta';
import { useCurrentVaultCoins } from '../../state/currentVault';
import { useSendAmount } from '../state/amount';
import { useCurrentSendCoin } from '../state/sendCoin';

const Input = styled(TextInput)`
  ${text({
    family: 'mono',
    size: 16,
    weight: '400',
  })}
`;

export const AmountInGlobalCurrencyDisplay = () => {
  const { t } = useTranslation();
  const [sendAmount] = useSendAmount();
  const [coinKey] = useCurrentSendCoin();
  const coins = useCurrentVaultCoins();
  const { globalCurrency } = useGlobalCurrency();
  const coin = useMemo(() => {
    return storageCoinToCoin(
      shouldBePresent(
        coins.find(coin => areEqualCoins(getStorageCoinKey(coin), coinKey))
      )
    );
  }, [coins, coinKey]);

  const {
    data: prices,
    isPending,
    errors,
  } = useCoinPricesQuery([CoinMeta.fromCoin(coin)]);

  const normalizedPrices = Array.isArray(prices)
    ? prices.map(p => ({
        ...p,
        price: p.price || (p as any)[globalCurrency],
      }))
    : [];

  const price = normalizedPrices[0]?.price;
  const calculatedSendAmountInFiat =
    price && sendAmount ? sendAmount * price : undefined;

  return (
    <Input
      label={
        <HStack
          alignItems="center"
          justifyContent="space-between"
          gap={16}
          fullWidth
        >
          {`Amount (in ${globalCurrency})`}
        </HStack>
      }
      value={
        (sendAmount && !calculatedSendAmountInFiat) || errors.length > 0
          ? t('failed_to_load')
          : calculatedSendAmountInFiat !== undefined
            ? calculatedSendAmountInFiat.toFixed(2) + ' ' + globalCurrency
            : ''
      }
      disabled
      placeholder={isPending ? t('loading') : ''}
    />
  );
};
