import { ComponentProps } from 'react'
import styled from 'styled-components'

import { UnstyledButton } from '../buttons/UnstyledButton'
import { CircleMinusIcon } from '../icons/CircleMinusIcon'
import { CirclePlusIcon } from '../icons/CirclePlusIcon'
import { TextInput } from '../inputs/TextInput'
import { HStack, VStack, vStack } from '../layout/Stack'
import { getColor } from '../theme/getters'

type StepperProps = {
  value: number
  onValueChange: (value: number | null) => void
  min: number
  max: number
} & Partial<ComponentProps<typeof TextInput>>

export const Stepper = ({
  value,
  onValueChange,
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

          onValueChange(newValue)
        }}
      >
        <CircleMinusIcon />
      </StepControl>
      <VStack flexGrow>
        <Input
          type="number"
          onValueChange={value => {
            const numValue = parseInt(value)
            onValueChange(isNaN(numValue) ? null : numValue)
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

          onValueChange(newValue)
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
