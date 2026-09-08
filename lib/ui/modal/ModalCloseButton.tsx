import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { CrossIcon } from '@lib/ui/icons/CrossIcon'
import { OnClickProp, UiProps } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { Hoverable } from '../base/Hoverable'

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

/** Dismisses the modal it sits in; every modal that can close renders one. */
export const ModalCloseButton = (props: OnClickProp & UiProps) => {
  return (
    <Container data-testid="modal-close-button" {...props}>
      <IconWrapper>
        <CrossIcon />
      </IconWrapper>
    </Container>
  )
}
