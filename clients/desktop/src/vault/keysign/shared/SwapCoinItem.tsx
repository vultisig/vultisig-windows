import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { formatAmount } from '@lib/utils/formatAmount'
import styled from 'styled-components'

import { ChainCoinIcon } from '../../../chain/ui/ChainCoinIcon'
import { getChainEntityIconSrc } from '../../../chain/utils/getChainEntityIconSrc'
import { getCoinLogoSrc } from '../../../coin/logo/getCoinLogoSrc'
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery'
import { vStack } from '../../../lib/ui/layout/Stack'
import { Text } from '../../../lib/ui/text'
import { useFiatCurrency } from '../../../preferences/state/fiatCurrency'
import { shouldDisplayChainLogo } from '../../chain/utils'
import { SwapStackItem } from './SwapKeysignTxOverview'

export const SwapCoinItem = ({
  coin,
  tokenAmount,
}: {
  coin: AccountCoin
  tokenAmount: number | null
}) => {
  const [fiatCurrency] = useFiatCurrency()
  const coinPriceQuery = useCoinPriceQuery({
    coin,
  })

  const { chain, ticker } = coin

  return (
    <SwapVStackItem>
      <ChainCoinIcon
        coinSrc={getCoinLogoSrc(coin.logo)}
        chainSrc={
          shouldDisplayChainLogo({
            ticker: coin.ticker,
            chain: chain,
            isNative: isFeeCoin({
              id: coin.id,
              chain: chain,
            }),
          })
            ? getChainEntityIconSrc(chain)
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
            success={price =>
              price ? (
                <Text centerHorizontally color="supporting" size={12}>
                  {formatAmount(tokenAmount * price, fiatCurrency)}
                </Text>
              ) : null
            }
            error={() => null}
            pending={() => null}
          />
        )}
      </div>
    </SwapVStackItem>
  )
}

const SwapVStackItem = styled(SwapStackItem)`
  min-width: 169px;
  ${vStack({
    gap: 12,
    alignItems: 'center',
  })}
`
