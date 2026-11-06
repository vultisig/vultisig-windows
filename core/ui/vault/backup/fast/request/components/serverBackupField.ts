import {
  settingsFieldHairline,
  settingsFieldSurface,
  settingsInputHeight,
  settingsOutlinedTextInput,
} from '@core/ui/settings/settingsField'
import { CollapsedFieldContainer } from '@core/ui/vault/components/action-form/CollapsedFieldContainer'
import { borderRadius } from '@lib/ui/css/borderRadius'
import styled, { css } from 'styled-components'

/** A Server Backup text field: the settings input at radius 12, with a faint resting border. */
export const serverBackupTextInput = css`
  ${settingsOutlinedTextInput};
  ${borderRadius.md};
  border-color: ${settingsFieldHairline};
`

// A 1px border inside the frame's 16 padding.
const collapsedRowPadding = 15

/** A closed Server Backup field, the same size as the open one. */
export const ServerBackupCollapsedRow = styled(CollapsedFieldContainer)`
  ${settingsFieldSurface};
  ${borderRadius.md};
  min-height: ${settingsInputHeight}px;
  padding: ${collapsedRowPadding}px;
`
