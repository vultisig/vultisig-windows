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

import { useKeysignUtxoInfo } from '../../../mpc/keysign/utxo/queries/keysignUtxoInfo'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useDepositChainSpecificQuery } from '../queries/useDepositChainSpecificQuery'

export const DepositFiatFeeValue = ({ amount }: { amount: bigint }) => {
  const [coin] = useDepositCoin()
  const fiatCurrency = useFiatCurrency()
  const priceQuery = useCoinPriceQuery({
    coin,
    fiatCurrency,
  })

  const formatFiatAmount = useFormatFiatAmount()

  const chainSpecificQuery = useDepositChainSpecificQuery(coin)
  const { decimals } = chainFeeCoin[coin.chain]
  const utxoInfoQuery = useKeysignUtxoInfo({
    chain: coin.chain,
    address: coin.address,
  })
  const query = useTransformQueriesData(
    {
      price: priceQuery,
      chainSpecific: chainSpecificQuery,
      utxoInfo: utxoInfoQuery,
    },
    useCallback(
      ({ price, chainSpecific, utxoInfo }) => {
        const fee = getFeeAmount({
          chainSpecific,
          utxoInfo,
          amount,
          chain: coin.chain,
        })

        const feeAmount = fromChainAmount(fee, decimals)

        return formatFiatAmount(feeAmount * price)
      },
      [decimals, formatFiatAmount, amount, coin.chain]
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
