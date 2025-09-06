import { css } from 'styled-components'

import { mediaQuery } from '../responsive/mediaQuery'

export const applyResponsiveLayoutWidth = css`
  @media ${mediaQuery.mobileDeviceAndDown} {
    width: 100%;
  }

  @media ${mediaQuery.tabletDeviceAndUp} {
    width: 750px;
  }

  @media ${mediaQuery.desktopDeviceAndUp} {
    width: 800px;
  }
`
