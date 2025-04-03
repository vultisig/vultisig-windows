import { centerContent } from '@lib/ui/css/centerContent'
import { takeWholeSpace } from '@lib/ui/css/takeWholeSpace'
import styled from 'styled-components'

export const CenterAbsolutely = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  ${takeWholeSpace};
  ${centerContent};
`
