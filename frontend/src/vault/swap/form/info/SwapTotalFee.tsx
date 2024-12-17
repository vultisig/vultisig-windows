import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { NativeSwapEnabledChain } from '../../../../chain/swap/native/NativeSwapChain';
import { getNativeSwapDecimals } from '../../../../chain/swap/native/utils/getNativeSwapDecimals';
import { getChainFeeCoin } from '../../../../chain/tx/fee/utils/getChainFeeCoin';
import { fromChainAmount } from '../../../../chain/utils/fromChainAmount';
import { getCoinMetaKey } from '../../../../coin/utils/coinMeta';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery';
import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery';
import { useSwapSpecificTxInfoQuery } from '../../queries/useSwapSpecificTxInfoQuery';
import { useFromCoin } from '../../state/fromCoin';
import { useToCoin } from '../../state/toCoin';
import { SwapTotalFeeFiatValue } from './SwapTotalFeeFiatValue';

export const SwapTotalFee = () => {
  const query = useSwapQuoteQuery();

  const txInfo = useSwapSpecificTxInfoQuery();

  const [fromCoinKey] = useFromCoin();
  const [toCoinKey] = useToCoin();

  const fromGasCoin = useMemo(
    () => getChainFeeCoin(fromCoinKey.chain),
    [fromCoinKey.chain]
  );

  const { t } = useTranslation();

  return (
    <>
      <span>{t('estimated_fees')}</span>
      <MatchQuery
        value={query}
        error={() => null}
        pending={() => <Spinner />}
        success={swapQuote => {
          return (
            <MatchQuery
              value={txInfo}
              error={() => null}
              pending={() => <Spinner />}
              success={({ fee }) => {
                const decimals = getNativeSwapDecimals(
                  fromCoinKey.chain as NativeSwapEnabledChain
                );

                return (
                  <SwapTotalFeeFiatValue
                    value={[
                      {
                        ...toCoinKey,
                        amount: fromChainAmount(swapQuote.fees.total, decimals),
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
                );
              }}
            />
          );
        }}
      />
    </>
  );
};
