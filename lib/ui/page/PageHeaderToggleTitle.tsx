import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { OnClickProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

type PageHeaderToggleTitleProps = ValueProp<string> & OnClickProp

const Indicator = styled(CollapsableStateIndicator)`
  font-size: 12px;
`

const Container = styled(UnstyledButton)`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 12px;
`

export const PageHeaderToggleTitle = ({
  value,
  onClick,
}: PageHeaderToggleTitleProps) => {
  return (
    <Container onClick={onClick}>
      <Text as="div" color="contrast" size={18} weight={500}>
        {value}
      </Text>
      <Indicator />
    </Container>
  )
}
