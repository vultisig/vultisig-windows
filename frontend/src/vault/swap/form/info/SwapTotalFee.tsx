import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { thorchainSwapConfig } from '../../../../chain/thor/swap/config';
import { fromThorchainSwapAsset } from '../../../../chain/thor/swap/utils/swapAsset';
import { fromChainAmount } from '../../../../chain/utils/fromChainAmount';
import { getChainPrimaryCoin } from '../../../../chain/utils/getChainPrimaryCoin';
import { getCoinMetaKey } from '../../../../coin/utils/coinMeta';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import { QueryDependant } from '../../../../lib/ui/query/components/QueryDependant';
import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery';
import { useSwapSpecificTxInfoQuery } from '../../queries/useSwapSpecificTxInfoQuery';
import { useFromCoin } from '../../state/fromCoin';
import { SwapTotalFeeFiatValue } from './SwapTotalFeeFiatValue';

export const SwapTotalFee = () => {
  const query = useSwapQuoteQuery();

  const txInfo = useSwapSpecificTxInfoQuery();

  const [fromCoinKey] = useFromCoin();

  const fromGasCoin = useMemo(
    () => getChainPrimaryCoin(fromCoinKey.chainId),
    [fromCoinKey.chainId]
  );

  const { t } = useTranslation();

  return (
    <>
      <span>{t('estimated_fees')}</span>
      <QueryDependant
        query={query}
        error={() => null}
        pending={() => <Spinner />}
        success={swapQuote => (
          <QueryDependant
            query={txInfo}
            error={() => null}
            pending={() => <Spinner />}
            success={({ fee }) => (
              <SwapTotalFeeFiatValue
                value={[
                  {
                    ...fromThorchainSwapAsset(swapQuote.fees.asset),
                    amount: fromChainAmount(
                      swapQuote.fees.total,
                      thorchainSwapConfig.decimals
                    ),
                  },
                  {
                    ...getCoinMetaKey(fromGasCoin),
                    amount: fromChainAmount(
                      BigInt(Math.round(fee)),
                      fromGasCoin.decimals
                    ),
                  },
                ]}
              />
            )}
          />
        )}
      />
    </>
  );
};
