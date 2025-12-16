import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { usdc } from '@core/chain/coin/knownTokens'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { getCoinLogoSrc } from '@core/ui/chain/coin/icon/utils/getCoinLogoSrc'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { vStack } from '@lib/ui/layout/Stack'
import { IsActiveProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

import { DefiPosition } from '../../../storage/defiPositions'
import {
  resolveDefiPositionCoin,
  resolveDefiPositionIcon,
} from '../config/defiPositionResolver'

type Props = {
  position: DefiPosition
  isSelected: boolean
  isLoading: boolean
  onToggle: () => void
}

const PositionCard = styled(UnstyledButton)<{
  isSelected: boolean
  isLoading: boolean
}>`
  ${vStack({
    gap: 11,
  })};

  width: 74px;
`

const PositionIconWrapper = styled.div<IsActiveProp>`
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

const DualIconWrapper = styled.div`
  position: relative;
`

const SecondaryIconWrapper = styled.div`
  position: absolute;
  top: -0.25em;
  right: -0.25em;
  font-size: 0.56em;
  border-radius: 999px;
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foreground')};
`

const lpSecondaryCoinByTicker: Record<string, { logo: string } | undefined> = {
  ETH: chainFeeCoin[Chain.Ethereum],
  BTC: chainFeeCoin[Chain.Bitcoin],
  BNB: chainFeeCoin[Chain.BSC],
  USDC: usdc,
}

const getLpSecondaryIconSrc = (position: DefiPosition): string | undefined => {
  const pair = (position.ticker || position.name).split('/')
  if (pair.length < 2) return undefined

  const secondaryTicker = pair[1]?.trim().toUpperCase()
  if (!secondaryTicker) return undefined

  const coin = lpSecondaryCoinByTicker[secondaryTicker]
  if (!coin?.logo) return undefined

  return getCoinLogoSrc(coin.logo)
}

export const DefiPositionTile = ({
  position,
  isSelected,
  onToggle,
  isLoading,
}: Props) => {
  const icon = resolveDefiPositionIcon(position)
  const coin = resolveDefiPositionCoin(position)

  const lpSecondaryIconSrc =
    position.type === 'lp' ? getLpSecondaryIconSrc(position) : undefined

  const label =
    position.type === 'lp'
      ? position.name || position.ticker
      : (coin.ticker ?? position.name)

  const handleClick = () => {
    if (isLoading) return

    onToggle()
  }

  return (
    <PositionCard
      onClick={handleClick}
      disabled={isLoading}
      isLoading={isLoading}
      isSelected={isSelected}
    >
      <PositionIconWrapper isActive={isSelected}>
        {position.type === 'lp' && lpSecondaryIconSrc ? (
          <DualIconWrapper>
            <ChainEntityIcon value={icon} style={{ fontSize: 27.5 }} />
            <SecondaryIconWrapper>
              <ChainEntityIcon value={lpSecondaryIconSrc} />
            </SecondaryIconWrapper>
          </DualIconWrapper>
        ) : (
          <ChainEntityIcon value={icon} style={{ fontSize: 27.5 }} />
        )}
        {isSelected && (
          <CheckBadge color="primary" size={12}>
            <CheckmarkIcon />
          </CheckBadge>
        )}
      </PositionIconWrapper>
      <Text cropped color="contrast" size={12} weight={500}>
        {label}
      </Text>
    </PositionCard>
  )
}
