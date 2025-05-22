import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { ChainCoinIcon } from '@core/ui/chain/coin/icon/ChainCoinIcon'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { shouldDisplayChainLogo } from '@core/ui/chain/coin/icon/utils/shouldDisplayChainLogo'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { VStack } from '@lib/ui/layout/Stack'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import styled from 'styled-components'

import { getChainLogoSrc } from '../../../../chain/metadata/getChainLogoSrc'
import { useFiatCurrency } from '../../../../storage/fiatCurrency'

export const SwapCoinItem = ({
  coin,
  tokenAmount,
}: {
  coin: AccountCoin
  tokenAmount: number | null
}) => {
  const fiatCurrency = useFiatCurrency()
  const coinPriceQuery = useCoinPriceQuery({
    coin,
  })

  const { chain, ticker } = coin

  return (
    <SwapVStackItem gap={12} alignItems="center">
      <ChainCoinIcon
        coinSrc={coin.logo ? getCoinLogoSrc(coin.logo) : undefined}
        chainSrc={
          shouldDisplayChainLogo({
            ticker: coin.ticker,
            chain: chain,
            isNative: isFeeCoin({
              id: coin.id,
              chain: chain,
            }),
          })
            ? getChainLogoSrc(chain)
            : undefined
        }
        style={{ fontSize: 36 }}
      />
      <div>
        <Text centerHorizontally color="contrast" size={14}>
          {tokenAmount} {ticker.toUpperCase()}
        </Text>
        {tokenAmount && (
          <MatchQuery
            value={coinPriceQuery}
            success={price => (
              <Text centerHorizontally color="supporting" size={12}>
                {formatAmount(tokenAmount * price, fiatCurrency)}
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
  min-width: 169px;
  padding: 24px 16px;
  border-radius: 16px;
  border: 1px solid ${getColor('foregroundExtra')};
  background-color: ${getColor('foreground')};
`
