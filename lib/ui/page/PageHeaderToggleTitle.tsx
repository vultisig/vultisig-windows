import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { ChildrenProp, InputProps } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

type PageHeaderToggleTitleProps = ChildrenProp & InputProps<boolean>

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
  children,
  onChange,
}: PageHeaderToggleTitleProps) => {
  return (
    <Text as="div" color="contrast" size={18} weight={500}>
      <Container onClick={() => onChange(!value)}>
        {children} <Indicator isOpen={value} />
      </Container>
    </Text>
  )
}
