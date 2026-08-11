import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import styled from 'styled-components'

const RoundedCoinIconWrapper = styled.div`
  ${borderRadius.pill};
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
