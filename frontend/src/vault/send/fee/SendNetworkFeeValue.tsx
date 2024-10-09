import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { Text, text } from '../../../lib/ui/text';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { CoinMeta } from '../../../model/coin-meta';
import { useAssertCurrentVaultCoin } from '../../state/useCurrentVault';
import { useSpecificSendTxInfoQuery } from '../queries/useSpecificSendTxInfoQuery';
import { useCurrentSendCoin } from '../state/sendCoin';

const Container = styled.p`
  ${text({
    color: 'contrast',
    size: 14,
    weight: 400,
    family: 'mono',
  })}
`;

export const SendNetworkFeeValue = () => {
  const { t } = useTranslation();

  const txSpecificInfoQuery = useSpecificSendTxInfoQuery();
  const [coinKey] = useCurrentSendCoin();
  const coin = useAssertCurrentVaultCoin(coinKey);
  const { decimals, ticker } = coin;
  const priceQuery = useCoinPriceQuery(
    CoinMeta.fromCoin(storageCoinToCoin(coin))
  );

  const { globalCurrency } = useGlobalCurrency();

  return (
    <Container>
      <QueryDependant
        query={txSpecificInfoQuery}
        pending={() => <Spinner />}
        error={() => <Text>{t('failed_to_load')}</Text>}
        success={({ fee }) => {
          return (
            <>
              {formatAmount(fromChainAmount(fee, decimals))} {ticker}{' '}
              <QueryDependant
                query={priceQuery}
                pending={() => <Spinner />}
                error={() => null}
                success={price => {
                  return (
                    <>
                      (~{formatAmount(fromChainAmount(fee, decimals) * price)}{' '}
                      {globalCurrency})
                    </>
                  );
                }}
              />
            </>
          );
        }}
      />
    </Container>
  );
};
