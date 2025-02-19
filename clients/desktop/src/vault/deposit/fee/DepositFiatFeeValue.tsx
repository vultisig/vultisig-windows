import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { formatAmount } from '@lib/utils/formatAmount'

import { getFeeAmount } from '../../../chain/tx/fee/utils/getFeeAmount'
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery'
import { Spinner } from '../../../lib/ui/loaders/Spinner'
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery'
import { useFiatCurrency } from '../../../preferences/state/fiatCurrency'
import { useCurrentVaultCoin } from '../../state/currentVault'
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin'
import { useDepositChainSpecific } from './DepositChainSpecificProvider'

export const DepositFiatFeeValue = () => {
  const [coinKey] = useCurrentDepositCoin()
  const coin = useCurrentVaultCoin(coinKey)
  const priceQuery = useCoinPriceQuery({
    coin,
  })

  const [fiatCurrency] = useFiatCurrency()

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
