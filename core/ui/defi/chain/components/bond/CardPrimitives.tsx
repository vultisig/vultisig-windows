import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack } from '@lib/ui/layout/Stack'
import { Panel } from '@lib/ui/panel/Panel'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const BondCard = styled(Panel)`
  padding: 16px;
  ${borderRadius.lg};
  background: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
`

export const BondSectionHeader = styled(HStack)`
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`
