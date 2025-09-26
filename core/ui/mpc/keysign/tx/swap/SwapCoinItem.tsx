import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { VStack } from '@lib/ui/layout/Stack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const SwapCoinItem = ({
  coin,
  tokenAmount,
}: {
  coin: AccountCoin
  tokenAmount: number | null
}) => {
  const formatFiatAmount = useFormatFiatAmount()
  const coinPriceQuery = useCoinPriceQuery({
    coin,
  })

  const { ticker } = coin

  return (
    <SwapVStackItem gap={12} alignItems="center">
      <CoinIcon coin={coin} style={{ fontSize: 36 }} />
      <div>
        <Text centerHorizontally color="contrast" size={14}>
          {tokenAmount} {ticker.toUpperCase()}
        </Text>
        {tokenAmount && (
          <MatchQuery
            value={coinPriceQuery}
            success={price => (
              <Text centerHorizontally color="supporting" size={12}>
                {formatFiatAmount(tokenAmount * price)}
              </Text>
            )}
            error={() => null}
            pending={() => null}
          />
        )}
      </div>
    </SwapVStackItem>
  )
}

const SwapVStackItem = styled(VStack)`
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 16px;
  flex: 1;
  min-width: 169px;
  padding: 24px 16px;
`
