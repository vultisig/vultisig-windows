import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { match } from '@lib/utils/match'
import { AnimatePresence, motion } from 'framer-motion'

import { useFormatFiatAmount } from '../../../chain/hooks/useFormatFiatAmount'
import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'
import { CurrencyInputMode } from './ManageAmountInputField'

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
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
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
                    formatAmount(
                      fromChainAmount(sendAmount, coin.decimals),
                      coin
                    ),
                })}
              </Text>
            )
          }
        />
      </motion.span>
    </AnimatePresence>
  )
}
