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
  cursor: pointer;

  &:hover {
    background-color: ${getColor('foregroundExtra')};
  }
`

export const Container = styled(VStack)`
  margin-bottom: ${pageConfig.verticalPadding}px;
`

export const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  justify-content: center;
`

export const IconWrapper = styled.div`
  align-self: center;
  height: 30px;
  font-size: 24px;
`

export const AutoCenteredTitle = styled(Text)`
  align-self: center;
  margin-bottom: 12px;
`
