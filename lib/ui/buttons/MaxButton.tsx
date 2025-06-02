import styled from 'styled-components'

import { UnstyledButton } from '../button'
import { borderRadius } from '../css/borderRadius'
import { centerContent } from '../css/centerContent'
import { horizontalPadding } from '../css/horizontalPadding'
import { textInputHeight } from '../css/textInput'
import { toSizeUnit } from '../css/toSizeUnit'
import { text } from '../text'
import { getColor } from '../theme/getters'

export const maxButtonOffset = 8
const maxButtonHeight = textInputHeight - maxButtonOffset * 2

export const MaxButton = styled(UnstyledButton)`
  ${horizontalPadding(8)};
  ${borderRadius.s};
  ${centerContent};
  height: ${toSizeUnit(maxButtonHeight)};

  ${text({
    weight: 600,
    size: 16,
    color: 'contrast',
  })}

  &:hover {
    background: ${getColor('mist')};
  }

  text-transform: uppercase;
`
