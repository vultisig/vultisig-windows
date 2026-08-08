import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { panel } from '@lib/ui/panel/Panel'
import { IsActiveProp, OnClickProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { getColor, matchColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

const Container = styled(UnstyledButton)<IsActiveProp>`
  ${panel()};

  position: relative;
  width: 100%;
  text-align: left;

  border: 2px solid
    ${matchColor('isActive', { true: 'primary', false: 'transparent' })};

  &:hover {
    background: ${getColor('foregroundExtra')};
  }
`

const Value = styled(Text)`
  overflow-wrap: anywhere;
`

export const DepositActionOption = ({
  value,
  onClick,
  isActive,
}: ValueProp<string> & OnClickProp & IsActiveProp) => {
  return (
    <Container isActive={isActive} onClick={onClick}>
      <Value color="contrast" size={16} weight="500">
        {value}
      </Value>
    </Container>
  )
}
