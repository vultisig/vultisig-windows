import { centerContent } from '@lib/ui/css/centerContent'
import { getColor } from '@lib/ui/theme/getters'
import { ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${getColor('foreground')};
  ${centerContent};
  box-shadow: 0 0 20px
    ${({ theme }) => theme.colors.primary.withAlpha(0.2).toCssValue()};
  color: ${getColor('primary')};
  font-size: 24px;
`

export const GlowIcon = ({ icon }: { icon: ReactNode }) => (
  <Container>{icon}</Container>
)
