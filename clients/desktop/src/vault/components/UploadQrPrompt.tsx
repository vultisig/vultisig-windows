import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { CameraIcon } from '@lib/ui/icons/CameraIcon'
import { pageConfig } from '@lib/ui/page/config'
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

const Position = styled.div`
  position: fixed;
  bottom: ${toSizeUnit(pageConfig.verticalPadding)};
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  z-index: 1;
`

export const UploadQrPrompt = () => {
  const navigate = useCoreNavigate()

  return (
    <Position>
      <Container onClick={() => navigate({ id: 'uploadQr', state: {} })}>
        <CameraIcon />
      </Container>
    </Position>
  )
}
