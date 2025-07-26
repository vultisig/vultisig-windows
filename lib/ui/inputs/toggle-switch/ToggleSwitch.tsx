import { Button, buttonSize } from '@lib/ui/buttons/Button'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { HStack, StackProps } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { ComponentType, ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { ButtonProps } from '../../buttons/ButtonProps'
import { ChildrenProp } from '../../props'

export type Option<T extends string | number> = {
  icon?: ReactNode
  label: string
  value: T
}

export type ContainerProps = Partial<StackProps> & {
  children: ReactNode
  disabled?: boolean
  className?: string
}

export type OptionRenderState = ChildrenProp &
  Partial<ButtonProps> & {
    active: boolean
    disabled: boolean
    icon: ReactNode
  }

export type OptionButtonProps = OptionRenderState & {
  className?: string
}

export type Slots = {
  Container?: ComponentType<ContainerProps>
  OptionButton?: ComponentType<OptionButtonProps>
}

export type ToggleSwitchProps<T extends string | number> = {
  options: Readonly<Option<T>[]>
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  className?: string
  optionClassName?: string
  slots?: Slots
}

export const ToggleSwitch = <T extends string | number>({
  options,
  value,
  onChange,
  disabled = false,
  slots: {
    Container = DefaultContainer,
    OptionButton = DefaultToggleButton,
  } = {},
}: ToggleSwitchProps<T>) => {
  const handleClick = (newValue: T) => {
    if (disabled) return
    onChange(newValue)
  }

  return (
    <Container gap={8}>
      {options.map(({ value: currValue, icon, label }) => {
        const isActive = currValue === value

        return (
          <OptionButton
            active={isActive}
            disabled={isActive || disabled}
            icon={icon}
            key={currValue}
            kind="link"
            onClick={() => handleClick(currValue)}
          >
            {label}
          </OptionButton>
        )
      })}
    </Container>
  )
}

const DefaultContainer = styled(HStack)`
  background-color: ${getColor('foregroundExtra')};
  border-radius: ${toSizeUnit(buttonSize.md)};
  padding: 8px;
`

const DefaultToggleButton = styled(Button)<{
  active: boolean
  disabled: boolean
}>`
  ${({ active, disabled }) =>
    active
      ? css`
          background-color: ${getColor('background')};
          color: ${getColor('text')};
        `
      : disabled
        ? css`
            background-color: transparent;
          `
        : css``}
  height: 44px;
`
