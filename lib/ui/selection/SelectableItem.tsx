import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

const iconSize = 48

const IconWrapper = styled.div<{ isSelected: boolean }>`
  position: relative;
  width: ${iconSize}px;
  height: ${iconSize}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  ${({ isSelected }) =>
    isSelected &&
    css`
      outline: 2px solid ${getColor('primary')};
      outline-offset: 2px;
    `}
`

const CheckBadge = styled.div`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${getColor('primary')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${getColor('background')};
`

const Container = styled(UnstyledButton)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 12px;

  &:hover {
    background: ${getColor('mist')};
  }
`

type SelectableItemProps = InputProps<boolean> & {
  icon: ReactNode
  name: string
}

export const SelectableItem = ({
  value: isSelected,
  onChange,
  icon,
  name,
}: SelectableItemProps) => {
  return (
    <Container onClick={() => onChange(!isSelected)}>
      <IconWrapper isSelected={isSelected}>
        {icon}
        {isSelected && (
          <CheckBadge>
            <CheckIcon />
          </CheckBadge>
        )}
      </IconWrapper>
      <Text cropped color="contrast" size={12} weight={500}>
        {name}
      </Text>
    </Container>
  )
}
