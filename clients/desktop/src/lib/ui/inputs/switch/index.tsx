import { interactive } from '@lib/ui/css/interactive'
import { HStack } from '@lib/ui/layout/Stack'
import { InputProps, UiProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { match } from '@lib/utils/match'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { InvisibleHTMLCheckbox } from '../checkbox/InvisibleHTMLCheckbox'
import { SwitchSize } from './config'
import { SwitchContainer } from './SwitchContainer'
import { SwitchControl } from './SwitchControl'

type SwitchProps = UiProps &
  InputProps<boolean> & {
    size?: SwitchSize
    label?: ReactNode
  }

const Wrapper = styled(HStack)`
  ${interactive};

  color: ${getColor('text')};

  &:hover {
    color: ${getColor('contrast')};
  }

  &:hover ${SwitchControl} {
    transform: scale(1.08);
  }
`

export const Switch = ({
  value,
  onChange,
  label,
  size = 'm',
  ...rest
}: SwitchProps) => {
  return (
    <Wrapper as="label" alignItems="center" gap={8} {...rest}>
      <SwitchContainer size={size} isActive={value}>
        <SwitchControl isActive={value} size={size} />
        <InvisibleHTMLCheckbox value={value} onChange={onChange} />
      </SwitchContainer>
      {label && (
        <Text nowrap size={match(size, { m: () => 16, s: () => 14 })} as="div">
          {label}
        </Text>
      )}
    </Wrapper>
  )
}
