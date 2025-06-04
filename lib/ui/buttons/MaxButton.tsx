import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { textInputHeight } from '@lib/ui/css/textInput'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

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
