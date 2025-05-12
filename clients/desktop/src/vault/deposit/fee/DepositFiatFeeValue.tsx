import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { formatAmount } from '@lib/utils/formatAmount'

import { useDepositChainSpecific } from './DepositChainSpecificProvider'

export const DepositFiatFeeValue = () => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const coin = useCurrentVaultCoin(coinKey)
  const priceQuery = useCoinPriceQuery({
    coin,
  })

  const fiatCurrency = useFiatCurrency()

  const chainSpecific = useDepositChainSpecific()

  const { decimals } = chainFeeCoin[coinKey.chain]

  const fee = getFeeAmount(chainSpecific)

  const feeAmount = fromChainAmount(fee, decimals)

  return (
    <MatchQuery
      value={priceQuery}
      pending={() => <Spinner />}
      error={() => null}
      success={price => {
        const formattedAmount = formatAmount(feeAmount * price, fiatCurrency)

        return formattedAmount
      }}
    />
  )
}
