import { Coin } from '@core/chain/coin/Coin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatAmount } from '@lib/utils/formatAmount'
import styled from 'styled-components'

import { ChainCoinIcon } from '../../../chain/coin/icon/ChainCoinIcon'
import { getCoinLogoSrc } from '../../../chain/coin/icon/utils/getCoinLogoSrc'
import { shouldDisplayChainLogo } from '../../../chain/coin/icon/utils/shouldDisplayChainLogo'
import { useCoinPriceQuery } from '../../../chain/coin/price/queries/useCoinPriceQuery'
import { getChainLogoSrc } from '../../../chain/metadata/getChainLogoSrc'
import { useFiatCurrency } from '../../../storage/fiatCurrency'

export const TxOverviewAmount = ({
  amount,
  value,
}: ValueProp<Coin> & {
  amount: number
}) => {
  const { id, ticker, chain, logo } = value
  const priceQuery = useCoinPriceQuery({
    coin: value,
  })
  const fiatCurrency = useFiatCurrency()
  return (
    <OverviewWrapper alignItems="center" gap={12}>
      {value && (
        <ChainCoinIcon
          coinSrc={logo ? getCoinLogoSrc(logo) : undefined}
          chainSrc={
            shouldDisplayChainLogo({
              ticker,
              chain,
              isNative: isFeeCoin({
                id,
                chain,
              }),
            })
              ? getChainLogoSrc(chain)
              : undefined
          }
          style={{ fontSize: 32 }}
        />
      )}
      <VStack alignItems="center">
        <Text size={18}>
          {amount} {ticker}
        </Text>
        <MatchQuery
          value={priceQuery}
          success={price => (
            <Text size={13} color="supporting">
              {formatAmount(amount * price, fiatCurrency)}
            </Text>
          )}
        />
      </VStack>
    </OverviewWrapper>
  )
}

const OverviewWrapper = styled(VStack)`
  border-radius: 16px;
  padding: 16px;
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
`
