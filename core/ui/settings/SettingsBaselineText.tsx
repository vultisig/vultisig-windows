import { Text } from '@lib/ui/text'
import styled, { css } from 'styled-components'

/** Browsers round Brockmann's ascent down, which draws 13, 14, 15 and 16px text 1px above Figma. */
export const settingsBaselineOffset = css`
  position: relative;
  top: 1px;
`

/** Text moved down by {@link settingsBaselineOffset}. */
export const SettingsBaselineText = styled(Text)`
  ${settingsBaselineOffset};
`
