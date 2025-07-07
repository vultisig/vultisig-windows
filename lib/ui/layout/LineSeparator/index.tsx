import styled from 'styled-components'

import { getColor } from '../../theme/getters'

export const LineSeparator = styled.div`
  height: 1px;
  width: 100%;
  background: linear-gradient(
    90deg,
    ${getColor('foreground')} 0%,
    ${({ theme }) =>
        theme.colors.foreground
          .getVariant({
            s: () => 47,
            l: () => 30,
          })
          .toCssValue()}
      49.5%,
    ${getColor('foreground')} 100%
  );
`
