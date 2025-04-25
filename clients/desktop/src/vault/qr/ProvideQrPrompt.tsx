import { makeCorePath } from '@core/ui/navigation'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { getColor } from '@lib/ui/theme/getters'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const Container = styled(UnstyledButton)`
  ${round};
  background: ${getColor('primary')};
  ${centerContent};
  color: ${getColor('foreground')};
  ${sameDimensions(64)};
  font-size: 24px;
`

export const ProvideQrPrompt = () => {
  return (
    <Link to={makeCorePath('uploadQr', {})}>
      <Container as="div">
        <CameraIcon />
      </Container>
    </Link>
  )
}
