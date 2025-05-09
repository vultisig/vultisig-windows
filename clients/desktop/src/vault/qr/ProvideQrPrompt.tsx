import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { getColor } from '@lib/ui/theme/getters'
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
  const navigate = useCoreNavigate()
  return (
    <Container onClick={() => navigate('uploadQr', { state: {} })}>
      <CameraIcon />
    </Container>
  )
}
