import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

type AgentHeaderButtonProps = {
  children: ReactNode
  onClick: () => void
}

export const AgentHeaderButton = ({
  children,
  onClick,
}: AgentHeaderButtonProps) => (
  <Container onClick={onClick}>{children}</Container>
)

const Container = styled(UnstyledButton)`
  ${sameDimensions(24)};
  ${centerContent};
  flex-shrink: 0;
  font-size: 24px;
  color: ${getColor('contrast')};
  border-radius: 4px;

  &:hover {
    opacity: 0.7;
  }
`
