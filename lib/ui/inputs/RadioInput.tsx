import { Button } from '@lib/ui/buttons/Button'
import { UniformColumnGrid } from '@lib/ui/css/uniformColumnGrid'
import { UiProps } from '@lib/ui/props'

type RadioInputProps<T extends string> = UiProps & {
  value: T | null
  onChange: (value: T) => void
  options: readonly T[]
  renderOption: (option: T) => React.ReactNode
  minOptionHeight?: number
}

export const RadioInput = <T extends string>({
  value,
  onChange,
  options,
  renderOption,
  ...rest
}: RadioInputProps<T>) => {
  return (
    <UniformColumnGrid gap={8} {...rest}>
      {options.map(option => {
        const isActive = option === value

        return (
          <Button
            kind={isActive ? 'primary' : 'outlined'}
            key={option}
            onClick={() => onChange(option)}
          >
            {renderOption(option)}
          </Button>
        )
      })}
    </UniformColumnGrid>
  )
}
