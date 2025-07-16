import { ComponentProps } from 'react'
import styled from 'styled-components'

import { UnstyledButton } from '../buttons/UnstyledButton'
import { CircleMinusIcon } from '../icons/CircleMinusIcon'
import { CirclePlusIcon } from '../icons/CirclePlusIcon'
import { HStack, VStack, vStack } from '../layout/Stack'
import { InputProps } from '../props'
import { getColor } from '../theme/getters'
import { TextInput } from './TextInput'

type StepperProps = InputProps<number | null> & {
  min: number
  max: number
} & Partial<ComponentProps<typeof TextInput>>

export const Stepper = ({
  value,
  onChange,
  min,
  max,
  ...rest
}: StepperProps) => {
  return (
    <Wrapper fullWidth flexGrow gap={8}>
      <StepControl
        onClick={() => {
          const newValue = value - 1

          if (newValue < min) {
            return
          }

          onChange(newValue)
        }}
      >
        <CircleMinusIcon />
      </StepControl>
      <VStack flexGrow>
        <Input
          type="number"
          onValueChange={value => {
            const numValue = parseInt(value)
            onChange(isNaN(numValue) ? null : numValue)
          }}
          value={value}
          min={min}
          max={max}
          {...rest}
        />
      </VStack>
      <StepControl
        onClick={() => {
          const newValue = value + 1

          if (newValue > max) {
            return
          }

          onChange(newValue)
        }}
      >
        <CirclePlusIcon />
      </StepControl>
    </Wrapper>
  )
}

const Wrapper = styled(HStack)`
  max-height: 56px;
`

const StepControl = styled(UnstyledButton)`
  ${vStack({
    justifyContent: 'center',
    alignItems: 'center',
  })};

  padding: 16px;
  border-radius: 12px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: ${getColor('foreground')};
  width: 97px;
`

const Input = styled(TextInput)`
  border-radius: 12px;
  border: 1px solid ${getColor('foregroundSuper')};
  text-align: center;
`
