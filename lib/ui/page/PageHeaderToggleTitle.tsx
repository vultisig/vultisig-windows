import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { CollapsableStateIndicator } from '@lib/ui/layout/CollapsableStateIndicator'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { ChildrenProp, InputProps } from '@lib/ui/props'
import styled from 'styled-components'

type PageHeaderToggleTitleProps = ChildrenProp & InputProps<boolean>

const Indicator = styled(CollapsableStateIndicator)`
  font-size: 12px;
`

const Container = styled(UnstyledButton)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`

export const PageHeaderToggleTitle = ({
  value,
  children,
  onChange,
}: PageHeaderToggleTitleProps) => {
  return (
    <PageHeaderTitle>
      <Container onClick={() => onChange(!value)}>
        {children} <Indicator isOpen={value} />
      </Container>
    </PageHeaderTitle>
  )
}
