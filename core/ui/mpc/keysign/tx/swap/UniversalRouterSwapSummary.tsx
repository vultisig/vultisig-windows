import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { ArrowDownIcon } from '@lib/ui/icons/ArrowDownIcon'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { formatUnits } from 'ethers'
import { useTranslation } from 'react-i18next'

type UniversalRouterSwapSummaryProps = {
  fromCoin: Coin
  fromAmount: bigint
  toCoin: Coin
  toAmount: bigint
}

/**
 * Compact "swapped X → Y" summary for the keysign done screen when the memo
 * decoded into a Uniswap Universal Router swap. Mirrors the shape of
 * `TxOverviewAmount` so it can be dropped into the same slot.
 */
export const UniversalRouterSwapSummary = ({
  fromCoin,
  fromAmount,
  toCoin,
  toAmount,
}: UniversalRouterSwapSummaryProps) => {
  const { t } = useTranslation()

  return (
    <Panel>
      <VStack alignItems="center" gap={12}>
        <Text size={10} color="supporting">
          {t('swap')}
        </Text>
        <SwapLeg coin={fromCoin} amount={fromAmount} />
        <ArrowDownIcon />
        <SwapLeg coin={toCoin} amount={toAmount} />
      </VStack>
    </Panel>
  )
}

type SwapLegProps = {
  coin: Coin
  amount: bigint
}

const SwapLeg = ({ coin, amount }: SwapLegProps) => {
  const priceQuery = useCoinPriceQuery({ coin })
  const formatFiatAmount = useFormatFiatAmount()
  const display = Number(formatUnits(amount, coin.decimals))

  return (
    <VStack alignItems="center" gap={4}>
      <HStack alignItems="center" gap={8}>
        <CoinIcon coin={coin} style={{ fontSize: 24 }} />
        <Text size={16}>
          {display} {coin.ticker}
        </Text>
      </HStack>
      <MatchQuery
        value={priceQuery}
        success={price => (
          <Text color="supporting" size={12}>
            {formatFiatAmount(display * price)}
          </Text>
        )}
      />
    </VStack>
  )
}
