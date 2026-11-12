import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'
import { match } from '@vultisig/lib-utils/match'

import { useFormatFiatAmount } from '../../../chain/hooks/useFormatFiatAmount'
import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'
import { CurrencyInputMode } from './currencyInputMode'

/** The send amount in the other unit: its fiat value under the asset field, its asset amount above the fiat field. */
export const AmountInReverseCurrencyDisplay = ({
  value,
}: ValueProp<CurrencyInputMode>) => {
  const [sendAmount] = useSendAmount()
  const coin = useCurrentSendCoin()
  const formatFiatAmount = useFormatFiatAmount()
  const priceQuery = useCoinPriceQuery({
    coin,
  })
  return (
    <MatchQuery
      value={priceQuery}
      success={priceData =>
        sendAmount && (
          <Text color="shy" size={14}>
            {match(value, {
              base: () =>
                formatFiatAmount(
                  priceData * fromChainAmount(sendAmount, coin.decimals)
                ),
              fiat: () =>
                formatAmount(fromChainAmount(sendAmount, coin.decimals), coin),
            })}
          </Text>
        )
      }
    />
  )
}
