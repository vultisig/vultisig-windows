import styled from 'styled-components'

import { HStack, VStack } from '../../lib/ui/layout/Stack'
import { Panel } from '../../lib/ui/panel/Panel'
import { Text } from '../../lib/ui/text'
import { getColor } from '../../lib/ui/theme/getters'
import { pageConfig } from '../../ui/page/config'
import { PageSlice } from '../../ui/page/PageSlice'

export const ListItemPanel = styled(Panel)<{
  isSpecialItem?: boolean
}>`
  font-weight: ${isSpecialItem => (isSpecialItem ? '600' : '400')};
  font-size: 16px;
  color: ${({ isSpecialItem }) =>
    isSpecialItem ? getColor('foreground') : getColor('contrast')};
  background-color: ${({ isSpecialItem }) =>
    isSpecialItem ? getColor('primary') : getColor('foreground')};

  &:hover {
    background-color: ${({ isSpecialItem }) =>
      !isSpecialItem && getColor('foregroundExtra')};
  }
`

export const Container = styled(VStack)`
  margin-bottom: ${pageConfig.verticalPadding}px;
  justify-content: space-between;
`

export const StyledVStack = styled(VStack)`
  &:not(:last-child) {
    margin-bottom: 18px;
  }
`

export const Footer = styled.footer`
  width: fit-content;
  margin-inline: auto;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`

export const StyledPageSlice = styled(PageSlice)`
  display: flex;
  flex-direction: column;
  gap: 32px;
`

export const OpticallyAdjustedText = styled(Text)`
  margin-top: 2px;
`

export const IconWrapper = styled.div`
  font-size: 24px;
`

export const StyledListItemContentWrapper = styled(HStack)`
  // @tony: Added margin for optical vertical alignment
  margin-top: 5px;
`
