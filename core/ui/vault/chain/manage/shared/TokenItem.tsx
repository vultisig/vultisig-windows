import { areEqualCoins, Coin } from '@core/chain/coin/Coin'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { vStack } from '@lib/ui/layout/Stack'
import { IsActiveProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useMemo } from 'react'
import styled, { css } from 'styled-components'

type TokenItemProps = ValueProp<Coin> & {
  currentCoins: Coin[]
  onToggle: (coin: Coin) => void | Promise<void>
  isLoading?: boolean
}

export const TokenItem = ({
  value: coin,
  currentCoins,
  onToggle,
  isLoading = false,
}: TokenItemProps) => {
  const currentCoin = useMemo(() => {
    return currentCoins.find(c => areEqualCoins(c, coin))
  }, [currentCoins, coin])

  const isSelected = !!currentCoin

  const handleClick = () => {
    if (isLoading) return
    onToggle(coin)
  }

  return (
    <TokenCard
      onClick={handleClick}
      isSelected={isSelected}
      isLoading={isLoading}
    >
      <TokenIconWrapper isActive={isSelected}>
        <ChainEntityIcon
          value={coin.logo ? getCoinLogoSrc(coin.logo) : undefined}
          style={{ fontSize: 27.5 }}
        />
        {isSelected && (
          <CheckBadge color="primary" size={12}>
            <CheckmarkIcon />
          </CheckBadge>
        )}
      </TokenIconWrapper>
      <Text cropped color="contrast" size={12} weight={500}>
        {coin.ticker}
      </Text>
    </TokenCard>
  )
}

const TokenCard = styled(UnstyledButton)<{
  isSelected: boolean
  isLoading: boolean
}>`
  ${vStack({
    gap: 11,
  })};

  width: 74px;
`

const TokenIconWrapper = styled.div<IsActiveProp>`
  ${vStack({
    alignItems: 'center',
    justifyContent: 'center',
  })};
  position: relative;
  border-radius: 24px;
  background: rgba(11, 26, 58, 0.5);
  height: 74px;
  padding: 17px;
  opacity: ${({ isActive }) => (isActive ? 1 : 0.5)};

  ${({ isActive }) =>
    isActive &&
    css`
      border: 1.5px solid ${getColor('foregroundSuper')};
      background: ${getColor('foreground')};
    `}
`

const CheckBadge = styled(IconWrapper)`
  position: absolute;
  bottom: 0;
  right: 0;
  height: 24px;
  padding: 8px;
  border-radius: 40px 0 25px 0;
  background: ${getColor('foregroundSuper')};
  font-weight: 600;
`
