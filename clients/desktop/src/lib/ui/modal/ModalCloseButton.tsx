import { Hoverable } from '@lib/ui/base/Hoverable'
import { OnClickProp, UiProps } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { centerContent } from '../css/centerContent'
import { sameDimensions } from '../css/sameDimensions'
import { CloseIcon } from '../icons/CloseIcon'

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
