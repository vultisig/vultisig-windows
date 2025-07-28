import { Button, buttonSize } from '@lib/ui/buttons/Button'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { HStack, StackProps } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { ComponentType, ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { ButtonProps } from '../../buttons/ButtonProps'
import { ChildrenProp, UiProps } from '../../props'

export type ToggleSwitchOption<T extends string | number> = {
  icon?: ReactNode
  label: string
  value: T
}

type ContainerProps = Partial<StackProps> & {
  children: ReactNode
  disabled?: boolean
  className?: string
}

type OptionRenderState = ChildrenProp &
  Partial<ButtonProps> & {
    active: boolean
    disabled: boolean
    icon: ReactNode
  }

type OptionButtonProps = OptionRenderState & {
  className?: string
}

type Slots = {
  Container?: ComponentType<ContainerProps>
  OptionButton?: ComponentType<OptionButtonProps>
}

type ToggleSwitchProps<T extends string | number> = {
  options: Readonly<ToggleSwitchOption<T>[]>
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  slots?: Slots
} & UiProps

export const ToggleSwitch = <T extends string | number>({
  options,
  value,
  onChange,
  disabled = false,
  slots: {
    Container = DefaultContainer,
    OptionButton = DefaultToggleButton,
  } = {},
  ...rest
}: ToggleSwitchProps<T>) => {
  const handleClick = (newValue: T) => {
    if (disabled) return
    onChange(newValue)
  }

  return (
    <Container {...rest} gap={8}>
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
