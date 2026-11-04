import { HSLA } from '@lib/ui/colors/HSLA'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { getColor } from '@lib/ui/theme/getters'
import { css } from 'styled-components'

import { currentProductBrand } from '../product/brand'

// Figma Input fields/background and Borders/extra-light; no theme token carries them.
const fieldBackground = new HSLA(216, 83.3, 11.8)
const fieldBorder = new HSLA(0, 0, 100, 0.03)

/** Fill, border and radius of the settings input fields. */
export const settingsFieldSurface = css`
  ${borderRadius.lg};
  background: ${currentProductBrand === 'vultisig'
    ? fieldBackground.toCssValue()
    : getColor('foreground')};
  border: 1px solid ${fieldBorder.toCssValue()};
`

export const settingsInputHeight = 52

/** A settings text input with the frames' visible outline. */
export const settingsOutlinedTextInput = css`
  ${settingsFieldSurface};
  border-color: ${getColor('foregroundSuper')};
  color: ${getColor('text')};
  font-weight: 500;
  height: ${settingsInputHeight}px;
  line-height: 20px;
  padding: 15px;

  &:focus,
  &:active {
    border-color: ${getColor('primaryAccentFour')};
  }

  &::placeholder {
    color: ${getColor('textShy')};
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
  }
`

const validationBorder = (color: 'primary' | 'danger') => css`
  &,
  &:focus,
  &:active {
    border-color: ${getColor(color)};
  }
`

/** Keeps a settings field's validation border over its resting one. */
export const settingsFieldValidation = css<{
  validation?: 'valid' | 'invalid' | 'warning'
}>`
  ${({ validation }) => validation === 'valid' && validationBorder('primary')}
  ${({ validation }) => validation === 'invalid' && validationBorder('danger')}
`

// Figma Backgrounds/disabled; no theme token carries it.
const readOnlyBackground = 'rgba(11, 26, 58, 0.5)'

/** Fill and border of the read-only cards on the vault settings screens. */
export const settingsReadOnlySurface = css`
  background: ${currentProductBrand === 'vultisig'
    ? readOnlyBackground
    : getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
`
