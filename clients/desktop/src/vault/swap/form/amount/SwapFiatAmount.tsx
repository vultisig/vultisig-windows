import { EntityWithAmount } from '@lib/utils/entities/EntityWithAmount';
import styled from 'styled-components';

import { useFormatFiatAmount } from '../../../../chain/ui/hooks/useFormatFiatAmount';
import { CoinKey } from '../../../../coin/Coin';
import { useCoinPriceQuery } from '../../../../coin/query/useCoinPriceQuery';
import { getStorageCoinKey } from '../../../../coin/utils/storageCoin';
import { centerContent } from '../../../../lib/ui/css/centerContent';
import { toSizeUnit } from '../../../../lib/ui/css/toSizeUnit';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import { ValueProp } from '../../../../lib/ui/props';
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery';
import { text } from '../../../../lib/ui/text';
import { useCurrentVaultCoin } from '../../../state/currentVault';
import { amountConfig } from './config';

const Container = styled.div`
  position: absolute;
  pointer-events: none;
  right: ${toSizeUnit(amountConfig.horizontalPadding)};
  height: 100%;
  ${centerContent};
  ${text({
    color: 'supporting',
    weight: 700,
    size: 16,
  })};
`;

export const SwapFiatAmount = ({
  value,
}: ValueProp<CoinKey & EntityWithAmount>) => {
  const coin = useCurrentVaultCoin(value);

  const query = useCoinPriceQuery({
    coin: {
      ...getStorageCoinKey(coin),
      priceProviderId: coin.price_provider_id,
    },
  });

  const formatFiatAmount = useFormatFiatAmount();

  return (
    <Container>
      <MatchQuery
        value={query}
        error={() => null}
        pending={() => <Spinner />}
        success={price => formatFiatAmount(value.amount * price)}
      />
    </Container>
  );
};
