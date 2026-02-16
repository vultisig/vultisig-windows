import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
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
  align-self: stretch;
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

export const DefiPositionTile = ({
  position,
  isSelected,
  onToggle,
  isLoading,
}: Props) => {
  const icon = resolveDefiPositionIcon(position)
  const coin = resolveDefiPositionCoin(position)

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
        <DualIconWrapper>
          <ChainEntityIcon value={icon} style={{ fontSize: 27.5 }} />
        </DualIconWrapper>
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
