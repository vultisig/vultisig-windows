import { Button } from '@lib/ui/buttons/Button'
import styled from 'styled-components'

/** The primary button of the settings sub-screens; browsers draw its label 1px above Figma. */
export const SettingsCtaButton = styled(Button)`
  padding-top: 2px;
`

/** The content-sized primary button of the settings empty and status screens. */
export const SettingsHugCtaButton = styled(SettingsCtaButton)`
  font-weight: 600;
  padding-inline: 32px;
  white-space: nowrap;
  width: fit-content;
`
