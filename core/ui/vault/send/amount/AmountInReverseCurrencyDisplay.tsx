import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { formatAmount } from '@lib/utils/formatAmount'
import { match } from '@lib/utils/match'
import { AnimatePresence, motion } from 'framer-motion'

import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'
import { CurrencyInputMode } from './ManageAmountInputField'

export const AmountInReverseCurrencyDisplay = ({
  value,
}: ValueProp<CurrencyInputMode>) => {
  const [sendAmount] = useSendAmount()
  const coin = useCurrentSendCoin()
  const fiatCurrency = useFiatCurrency()

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
        {!sendAmount ? null : (
          <Text color="shy" size={14}>
            {match(value, {
              base: () =>
                formatAmount(
                  shouldBePresent(priceQuery.data) *
                    fromChainAmount(sendAmount, coin.decimals),
                  fiatCurrency
                ),
              fiat: () =>
                formatAmount(
                  fromChainAmount(sendAmount, coin.decimals),
                  coin.ticker
                ),
            })}
          </Text>
        )}
      </motion.span>
    </AnimatePresence>
  )
}
