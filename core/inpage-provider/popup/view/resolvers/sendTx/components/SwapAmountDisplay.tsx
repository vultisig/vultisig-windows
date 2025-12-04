import { Coin } from '@core/chain/coin/Coin'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { round } from '@lib/ui/css/round'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

const RoundedCoinIconWrapper = styled.div`
  ${round};
  display: inline-flex;
`

type SwapAmountDisplayProps = {
  coin: Coin
  amount: string
  useRoundedIcon?: boolean
}

export const SwapAmountDisplay = ({
  coin,
  amount,
  useRoundedIcon = false,
}: SwapAmountDisplayProps) => {
  const icon = <CoinIcon coin={coin} style={{ fontSize: 24 }} />

  return (
    <HStack gap={8}>
      {useRoundedIcon ? (
        <RoundedCoinIconWrapper>{icon}</RoundedCoinIconWrapper>
      ) : (
        icon
      )}
      <Text weight="500" size={17} color="contrast">
        {amount}{' '}
        {!useRoundedIcon && (
          <Text as="span" color="shy" size={17}>
            {coin.ticker.toUpperCase()}
          </Text>
        )}
      </Text>
    </HStack>
  )
}
