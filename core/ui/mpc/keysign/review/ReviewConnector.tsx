import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ChildrenProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

const outerSize = 40
const innerSize = 24

const Outer = styled.div`
  position: absolute;
  ${sameDimensions(outerSize)};
  ${centerContent};
  ${borderRadius.pill};
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
`

const Inner = styled.div`
  ${sameDimensions(innerSize)};
  ${centerContent};
  ${borderRadius.pill};
  background: ${getColor('foregroundExtra')};
  color: ${getColor('buttonTextDisabled')};
  font-size: 12px;
`

/**
 * The badge on the seam between two review cards — a chevron between sender
 * and receiver, a plus between two deposits. Centred on its parent, which must
 * be `position: relative`.
 */
export const ReviewConnector = ({ children }: ChildrenProp) => (
  <Outer>
    <Inner>{children}</Inner>
  </Outer>
)
