import { useMemo } from 'react';
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
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
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
  const [value] = useSendAmount();
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

  const pricesQuery = useCoinPricesQuery([CoinMeta.fromCoin(coin)]);
  const price = pricesQuery.data ? pricesQuery.data[0]?.price : undefined;
  const fiatValue = price && value ? value * price : undefined;

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
        fiatValue !== undefined
          ? fiatValue.toFixed(2) + ' ' + globalCurrency
          : ''
      }
      disabled
    />
  );
};
