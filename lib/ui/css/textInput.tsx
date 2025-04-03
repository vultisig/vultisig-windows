import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { css } from 'styled-components'

import { borderRadius } from './borderRadius'
import { horizontalPadding } from './horizontalPadding'
import { toSizeUnit } from './toSizeUnit'

export const textInputHorizontalPadding = 12
export const textInputHeight = 56
export const textInputBorderRadius = borderRadius.s

export const textInputFrame = css`
  height: ${toSizeUnit(textInputHeight)};
  width: 100%;
  ${horizontalPadding(textInputHorizontalPadding)};
  ${textInputBorderRadius};
`

export const textInputBackground = css`
  background: ${getColor('foreground')};
`

const interactiveTextInput = css`
  outline: 1px solid transparent;
  border: 1px solid transparent;

  &:hover {
    outline-color: ${getColor('mist')};
  }

  &:focus,
  &:active {
    border-color: ${getColor('foregroundSuper')};
  }
`

export const textInput = css`
  ${textInputFrame};
  font-size: 14px;
  font-weight: 700;

  ${textInputBackground};
  color: ${getColor('contrast')};

  &::placeholder {
    ${text({
      color: 'shy',
      size: 12,
      weight: '400',
    })}
  }

  ${interactiveTextInput};
`
