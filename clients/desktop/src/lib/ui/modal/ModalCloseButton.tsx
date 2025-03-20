import { OnClickProp, UiProps } from '@lib/ui/props'
import styled from 'styled-components'

import { Hoverable } from '../base/Hoverable'
import { centerContent } from '../css/centerContent'
import { sameDimensions } from '../css/sameDimensions'
import { CloseIcon } from '../icons/CloseIcon'
import { getColor } from '../theme/getters'

const IconWrapper = styled.div`
  font-size: 20px;
  ${sameDimensions(24)};
  ${centerContent};
`

const Container = styled(Hoverable)`
  color: ${getColor('contrast')};
  &:hover ${IconWrapper} {
    color: ${getColor('contrast')};
  }
`

export const ModalCloseButton = (props: OnClickProp & UiProps) => {
  return (
    <Container {...props}>
      <IconWrapper>
        <CloseIcon />
      </IconWrapper>
    </Container>
  )
}
