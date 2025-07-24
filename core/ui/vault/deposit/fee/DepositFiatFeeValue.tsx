import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { formatAmount } from '@lib/utils/formatAmount'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useDepositChainSpecificQuery } from '../queries/useDepositChainSpecificQuery'

export const DepositFiatFeeValue = () => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const coin = useCurrentVaultCoin(coinKey)
  const priceQuery = useCoinPriceQuery({
    coin,
  })

  const fiatCurrency = useFiatCurrency()

  const chainSpecificQuery = useDepositChainSpecificQuery()

  const { decimals } = chainFeeCoin[coinKey.chain]

  const query = useTransformQueriesData(
    {
      price: priceQuery,
      chainSpecific: chainSpecificQuery,
    },
    useCallback(
      ({ price, chainSpecific }) => {
        const fee = getFeeAmount(chainSpecific)

        const feeAmount = fromChainAmount(fee, decimals)

        return formatAmount(feeAmount * price, fiatCurrency)
      },
      [decimals, fiatCurrency]
    )
  )

  const { t } = useTranslation()

  return (
    <MatchQuery
      value={query}
      pending={() => <Spinner />}
      error={() => t('failed_to_load')}
      success={result => <>{result}</>}
    />
  )
}
