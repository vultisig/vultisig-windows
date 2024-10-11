import { useTranslation } from 'react-i18next';

import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { StrictText, Text } from '../../../lib/ui/text';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { CoinMeta } from '../../../model/coin-meta';
import {
  useAssertCurrentVaultCoin,
  useAssertCurrentVaultNativeCoin,
} from '../../state/useCurrentVault';
import { useSpecificSendTxInfoQuery } from '../queries/useSpecificSendTxInfoQuery';
import { useCurrentSendCoin } from '../state/sendCoin';

export const SendFiatFeeValue = () => {
  const { t } = useTranslation();

  const txSpecificInfoQuery = useSpecificSendTxInfoQuery();
  const [coinKey] = useCurrentSendCoin();
  const coin = useAssertCurrentVaultCoin(coinKey);
  const { decimals } = useAssertCurrentVaultNativeCoin(coinKey.chainId);
  const priceQuery = useCoinPriceQuery(
    CoinMeta.fromCoin(storageCoinToCoin(coin))
  );

  const { globalCurrency } = useGlobalCurrency();

  return (
    <StrictText>
      <QueryDependant
        query={txSpecificInfoQuery}
        pending={() => <Spinner />}
        error={() => <Text>{t('failed_to_load')}</Text>}
        success={({ fee }) => {
          const feeAmount = fromChainAmount(fee, decimals);
          return (
            <QueryDependant
              query={priceQuery}
              pending={() => <Spinner />}
              error={() => null}
              success={price => {
                const formattedAmount = formatAmount(
                  feeAmount * price,
                  globalCurrency
                );

                return `~${formattedAmount}`;
              }}
            />
          );
        }}
      />
    </StrictText>
  );
};
