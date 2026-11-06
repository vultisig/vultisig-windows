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
