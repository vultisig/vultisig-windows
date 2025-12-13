import styled, { css } from 'styled-components'

import { getColor } from '../../theme/getters'

type LineSeparatorKind = 'gradient' | 'regular'

type LineSeparatorProps = {
  kind?: LineSeparatorKind
}

export const LineSeparator = styled.div<LineSeparatorProps>`
  height: 1px;
  width: 100%;
  ${({ kind = 'gradient' }) =>
    kind === 'gradient'
      ? css`
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
      : css`
          background: ${getColor('foregroundExtra')};
        `}
`
