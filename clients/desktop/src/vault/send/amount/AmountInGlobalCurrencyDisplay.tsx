import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { areEqualCoins } from '../../../coin/Coin';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import {
  getStorageCoinKey,
  storageCoinToCoin,
} from '../../../coin/utils/storageCoin';
import { TextInput } from '../../../lib/ui/inputs/TextInput';
import { HStack } from '../../../lib/ui/layout/Stack';
import { text } from '../../../lib/ui/text';
import { useFiatCurrency } from '../../../preferences/state/fiatCurrency';
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
  const [fiatCurrency] = useFiatCurrency();
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
    error,
  } = useCoinPriceQuery({
    coin: {
      ...coinKey,
      priceProviderId: coin.priceProviderId,
    },
  });

  const normalizedPrices = Array.isArray(prices)
    ? prices.map(p => ({
        ...p,
        price: p.price || (p as any)[fiatCurrency],
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
          {`Amount (in ${fiatCurrency})`}
        </HStack>
      }
      value={
        (sendAmount && !calculatedSendAmountInFiat) || error
          ? t('failed_to_load')
          : calculatedSendAmountInFiat !== undefined
            ? calculatedSendAmountInFiat.toFixed(2) + ' ' + fiatCurrency
            : ''
      }
      disabled
      placeholder={isPending ? t('loading') : ''}
    />
  );
};
