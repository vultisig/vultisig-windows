import { CheckmarkIcon } from '@lib/ui/icons/CheckmarkIcon'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const FormCheckBadge = () => {
  return (
    <Container>
      <CheckmarkIcon />
    </Container>
  )
}

const Container = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 0.6667px solid ${getColor('success')};
  background: ${getColor('background')};
  color: ${getColor('success')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`
