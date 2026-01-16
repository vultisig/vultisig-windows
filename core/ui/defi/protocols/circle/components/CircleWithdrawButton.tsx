import { Button, buttonHeight } from '@lib/ui/buttons/Button'
import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { ArrowWallDownIcon } from '@lib/ui/icons/ArrowWallDownIcon'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCircleViewState } from '../state/circleViewState'

const size = 'sm'
const iconPadding = 4
const iconSize = buttonHeight[size] - iconPadding * 2

export const CircleWithdrawButton = () => {
  const { t } = useTranslation()
  const [, setViewState] = useCircleViewState()

  return (
    <Container
      kind="outlined"
      size={size}
      onClick={() => setViewState('withdraw')}
    >
      <IconWrapper>
        <ArrowWallDownIcon />
      </IconWrapper>
      {t('circle.withdraw')}
    </Container>
  )
}

const Container = styled(Button)`
  padding-left: 40px;
`

const IconWrapper = styled.div`
  position: absolute;
  left: ${toSizeUnit(iconPadding)};
  top: 50%;
  transform: translateY(-50%);
  ${sameDimensions(iconSize)}
  ${round}
  background: rgba(255, 255, 255, 0.12);
  ${centerContent};
  color: ${getColor('text')};
  pointer-events: none;
`
