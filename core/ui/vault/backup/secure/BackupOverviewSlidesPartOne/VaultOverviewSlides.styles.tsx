import { VStack } from '@lib/ui/layout/Stack'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import styled from 'styled-components'

export const RiveWrapper = styled(VStack)`
  flex: 1;
  position: relative;

  @media (${mediaQuery.tabletDeviceAndUp}) {
    /* @tony: optical alignment */
    margin-top: 100px;
  }
`
