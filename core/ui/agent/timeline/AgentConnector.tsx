import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const AgentConnector = () => (
  <Container>
    <Line />
  </Container>
)

const Container = styled.div`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Line = styled.div`
  width: 1px;
  height: 10px;
  background: ${getColor('foregroundExtra')};
`
