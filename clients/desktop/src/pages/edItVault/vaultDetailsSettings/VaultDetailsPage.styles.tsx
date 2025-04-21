import { VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import { Panel } from '@lib/ui/panel/Panel'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

export const ListItemPanel = styled(Panel)`
  font-weight: 400;
  font-size: 16px;
  color: ${getColor('contrast')};
  background-color: ${getColor('foreground')};
`

export const Container = styled(VStack)`
  margin-bottom: ${pageConfig.verticalPadding}px;
`

export const AutoCenteredText = styled(Text)`
  margin-block: 12px;
  align-self: center;
`
