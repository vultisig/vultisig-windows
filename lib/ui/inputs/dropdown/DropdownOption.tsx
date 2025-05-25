import styled, { css } from 'styled-components'

import { horizontalPadding } from '../../css/horizontalPadding'
import { interactive } from '../../css/interactive'
import { textInputHorizontalPadding } from '../../css/textInput'
import { verticalPadding } from '../../css/verticalPadding'
import { getColor } from '../../theme/getters'

export const DropdownOption = styled.div<{ isActive: boolean }>`
  width: 100%;
  ${interactive};
  outline: none;

  ${horizontalPadding(textInputHorizontalPadding)};
  ${verticalPadding(8)}
  ${({ isActive }) =>
    isActive &&
    css`
      background: ${getColor('mist')};
      color: ${getColor('contrast')};
    `}
`
