import { getColor } from '@lib/ui/theme/getters'
import { css } from 'styled-components'

import { round } from './round'

export const themedScrollbars = css`
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background-color: ${getColor('mist')};
  }

  &::-webkit-scrollbar-thumb {
    ${round}
    cursor: pointer;
    background-color: ${getColor('textShy')};
    &:hover {
      background-color: ${getColor('textSupporting')};
    }
  }
`
