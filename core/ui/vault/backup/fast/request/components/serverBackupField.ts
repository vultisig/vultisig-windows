import {
  settingsFieldSurface,
  settingsInputHeight,
} from '@core/ui/settings/settingsField'
import { CollapsedFieldContainer } from '@core/ui/vault/components/action-form/CollapsedFieldContainer'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

// A 1px border inside the frame's 16 padding.
const fieldPadding = 15

const serverBackupFieldSurface = css`
  ${settingsFieldSurface};
  ${borderRadius.md};
`

/** A Server Backup text field: 52 tall, radius 12, on the settings field fill. */
export const serverBackupTextInput = css`
  ${serverBackupFieldSurface};
  color: ${getColor('text')};
  font-weight: 500;
  height: ${settingsInputHeight}px;
  line-height: 20px;
  padding: ${fieldPadding}px;

  &:focus,
  &:active {
    border-color: ${getColor('foregroundSuper')};
  }

  &::placeholder {
    color: ${getColor('textShy')};
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
  }
`

/** A closed Server Backup field, the same size as the open one. */
export const ServerBackupCollapsedRow = styled(CollapsedFieldContainer)`
  ${serverBackupFieldSurface};
  min-height: ${settingsInputHeight}px;
  padding: ${fieldPadding}px;
`
