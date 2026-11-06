import { Text } from '@lib/ui/text'
import styled from 'styled-components'

/** Browsers round Brockmann's ascent down, which draws 13, 14, 15 and 16px text 1px above Figma. */
export const SettingsBaselineText = styled(Text)`
  position: relative;
  top: 1px;
`
