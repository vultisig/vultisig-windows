import {
  useIsCircleVisible,
  useToggleCircleVisibility,
} from '@core/ui/storage/circleVisibility'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { CircleIcon } from '@lib/ui/icons/CircleIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { vStack } from '@lib/ui/layout/Stack'
import { IsActiveProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

import { circleName } from '../protocols/circle/core/config'

export const CircleItem = () => {
  const isSelected = useIsCircleVisible()
  const { toggle, isPending } = useToggleCircleVisibility()

  return (
    <CircleCard onClick={toggle} isLoading={isPending}>
      <CircleIconWrapper isActive={isSelected}>
        <IconWrapper size={27.5}>
          <CircleIcon />
        </IconWrapper>
        {isSelected && (
          <CheckBadge color="primary" size={12}>
            <CheckmarkIcon />
          </CheckBadge>
        )}
      </CircleIconWrapper>
      <Text cropped color="contrast" size={12} weight={500}>
        {circleName}
      </Text>
    </CircleCard>
  )
}

const CircleCard = styled(UnstyledButton)<{ isLoading: boolean }>`
  ${vStack({
    gap: 11,
  })};

  width: 74px;
  cursor: ${({ isLoading }) => (isLoading ? 'wait' : 'pointer')};
  opacity: ${({ isLoading }) => (isLoading ? 0.6 : 1)};
`

const CircleIconWrapper = styled.div<IsActiveProp>`
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
