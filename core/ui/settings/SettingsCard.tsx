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
