import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { hStack, VStack } from '@lib/ui/layout/Stack'
import { UiProps } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode, useId } from 'react'
import styled from 'styled-components'

import { borderRadius } from '../../css/borderRadius'
import { centerContent } from '../../css/centerContent'
import { horizontalPadding } from '../../css/horizontalPadding'
import { interactive } from '../../css/interactive'
import { round } from '../../css/round'
import { sameDimensions } from '../../css/sameDimensions'
import { InvisibleHTMLRadio } from '../InvisibleHTMLRadio'

type RadioOptionsListProps<T extends string | number | null> = UiProps & {
  value: T | null
  onChange: (value: T) => void
  options: readonly T[]
  renderOption: (option: T) => ReactNode
}

const OptionItem = styled.label<{ isSelected: boolean }>`
  position: relative;
  align-items: center;
  min-height: 56px;
  font-size: 16px;
  ${borderRadius.m};
  ${interactive}
  color: ${getColor('textShy')};
  ${horizontalPadding(16)}
  background: ${getColor('foreground')};
  ${hStack({
    alignItems: 'center',
    justifyContent: 'space-between',
  })}

  border: 1px solid ${getColor('foregroundExtra')};

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

const CheckContainer = styled.div`
  background: ${getColor('primary')};
  ${round}
  color: ${getColor('background')};
  ${sameDimensions(20)};
  ${centerContent};
`

export const RadioOptionsList = <T extends string | number | null>({
  value,
  onChange,
  options,
  renderOption,
  ...rest
}: RadioOptionsListProps<T>) => {
  const groupName = useId()

  return (
    <VStack gap={8} {...rest}>
      {options.map(option => {
        const isSelected = option === value
        const optionKey = option === null ? 'null' : option.toString()

        return (
          <OptionItem key={optionKey} isSelected={isSelected}>
            <InvisibleHTMLRadio
              groupName={groupName}
              value={option}
              isSelected={isSelected}
              onSelect={() => onChange(option)}
            />
            {renderOption(option)}
            {isSelected && (
              <CheckContainer>
                <CheckIcon fontSize={14} />
              </CheckContainer>
            )}
          </OptionItem>
        )
      })}
    </VStack>
  )
}
