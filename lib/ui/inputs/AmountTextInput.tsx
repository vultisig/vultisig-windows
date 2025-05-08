import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { TextInput, TextInputProps } from '@lib/ui/inputs/TextInput'
import { HStack } from '@lib/ui/layout/Stack'
import { text } from '@lib/ui/text'
import { ReactNode, useState } from 'react'
import styled from 'styled-components'

type AmountTextInputProps = Omit<TextInputProps, 'value' | 'onValueChange'> & {
  value: number | null
  onValueChange?: (value: number | null) => void
  unit?: ReactNode
  shouldBePositive?: boolean
  shouldBeInteger?: boolean
  suggestion?: ReactNode
}

const UnitContainer = styled.div`
  ${borderRadius.s};

  position: absolute;
  left: 12px;
  ${centerContent};
`

const Input = styled(TextInput)`
  ${text({
    size: 16,
    family: 'mono',
    weight: '400',
  })}
`

export const AmountTextInput = ({
  onValueChange,
  unit,
  value,
  shouldBePositive,
  shouldBeInteger,
  suggestion,
  label,
  placeholder,
  type = 'number',
  ref,
  ...props
}: AmountTextInputProps) => {
  const valueAsString = value?.toString() ?? ''
  const [inputValue, setInputValue] = useState<string>(valueAsString)

  return (
    <Input
      {...props}
      style={unit ? { paddingLeft: 36 } : undefined}
      type={type}
      onWheel={event => event.currentTarget.blur()}
      label={
        <HStack
          alignItems="center"
          justifyContent="flex-end"
          gap={16}
          fullWidth
        >
          {label}
          {suggestion}
        </HStack>
      }
      placeholder={placeholder ?? 'Enter amount'}
      value={
        Number(valueAsString) === Number(inputValue)
          ? inputValue
          : valueAsString
      }
      ref={ref}
      inputOverlay={unit ? <UnitContainer>{unit}</UnitContainer> : undefined}
      onValueChange={(value: string) => {
        if (shouldBePositive) {
          value = value.replace(/-/g, '')
        }

        if (value === '') {
          setInputValue('')
          onValueChange?.(null)
          return
        }

        const parse = shouldBeInteger ? parseInt : parseFloat
        const valueAsNumber = parse(value)
        if (isNaN(valueAsNumber)) {
          return
        }

        setInputValue(
          valueAsNumber.toString() !== value ? value : valueAsNumber.toString()
        )
        onValueChange?.(valueAsNumber)
      }}
    />
  )
}
