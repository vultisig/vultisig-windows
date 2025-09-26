import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useDepositChainSpecificQuery } from '../queries/useDepositChainSpecificQuery'

export const DepositFiatFeeValue = () => {
  const [coin] = useDepositCoin()
  const fiatCurrency = useFiatCurrency()
  const priceQuery = useCoinPriceQuery({
    coin,
    fiatCurrency,
  })

  const formatFiatAmount = useFormatFiatAmount()

  const chainSpecificQuery = useDepositChainSpecificQuery(coin)
  const { decimals } = chainFeeCoin[coin.chain]

  const query = useTransformQueriesData(
    {
      price: priceQuery,
      chainSpecific: chainSpecificQuery,
    },
    useCallback(
      ({ price, chainSpecific }) => {
        const fee = getFeeAmount(chainSpecific)

        const feeAmount = fromChainAmount(fee, decimals)

        return formatFiatAmount(feeAmount * price)
      },
      [decimals, formatFiatAmount]
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
