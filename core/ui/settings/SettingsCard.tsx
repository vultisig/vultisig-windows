import { borderRadius } from '@lib/ui/css/borderRadius'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

/** Rounded card stacking settings rows, with a hairline between rows. */
export const SettingsCard = styled.div`
  ${borderRadius.xl}
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 1px;

  > *:not(:last-child) {
    box-shadow: inset 0 -1px 0 ${getColor('foregroundExtra')};
  }
`

/** A settings card whose first row starts at its top edge, for pages that hold only this card. */
export const SettingsFlushCard = styled(SettingsCard)`
  flex-shrink: 0;
  padding-top: 0;
`

/** A flush settings card with its own fill and hairline border. */
export const SettingsBorderedCard = styled(SettingsFlushCard)`
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
`
