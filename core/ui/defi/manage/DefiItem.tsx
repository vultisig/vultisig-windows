import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { IconWrapper } from '@lib/ui/icons/IconWrapper'
import { vStack } from '@lib/ui/layout/Stack'
import { IsActiveProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

type DefiItemProps = {
  icon: ReactNode
  name: string
  isSelected: boolean
  isPending: boolean
  isDisabled?: boolean
  onClick: () => void
}

const iconSize = 27.5

export const DefiItem = ({
  icon,
  name,
  isSelected,
  isPending,
  isDisabled = false,
  onClick,
}: DefiItemProps) => {
  return (
    <Container
      onClick={onClick}
      isLoading={isPending}
      isDisabled={isDisabled}
      aria-disabled={isDisabled}
    >
      <IconContainer isActive={isSelected} isDisabled={isDisabled}>
        <IconWrapper style={{ fontSize: iconSize }} size={iconSize}>
          {icon}
        </IconWrapper>
        {isSelected && (
          <CheckBadge color="primary" size={12}>
            <CheckmarkIcon />
          </CheckBadge>
        )}
      </IconContainer>
      <Text
        cropped
        color={isDisabled ? 'supporting' : 'contrast'}
        size={12}
        weight={500}
      >
        {name}
      </Text>
    </Container>
  )
}

const Container = styled(UnstyledButton)<{
  isLoading: boolean
  isDisabled: boolean
}>`
  ${vStack({
    gap: 11,
  })};

  width: 74px;
  cursor: ${({ isLoading, isDisabled }) =>
    isDisabled ? 'not-allowed' : isLoading ? 'wait' : 'pointer'};
  opacity: ${({ isLoading, isDisabled }) =>
    isDisabled ? 0.4 : isLoading ? 0.6 : 1};
`

type IconContainerProps = IsActiveProp & { isDisabled: boolean }

const IconContainer = styled.div<IconContainerProps>`
  ${vStack({
    alignItems: 'center',
    justifyContent: 'center',
  })};
  position: relative;
  border-radius: 24px;
  background: rgba(11, 26, 58, 0.5);
  height: 74px;
  padding: 17px;
  opacity: ${({ isActive, isDisabled }) =>
    isDisabled ? 0.5 : isActive ? 1 : 0.5};

  ${({ isActive, isDisabled }) =>
    isActive &&
    !isDisabled &&
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
