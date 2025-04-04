import { borderRadius } from '@lib/ui/css/borderRadius'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { Checkbox } from '../../../../lib/ui/inputs/checkbox/Checkbox'
import { PageContent } from '../../../../ui/page/PageContent'

export const StyledCheckbox = styled(Checkbox)`
  pointer-events: none;
`

export const Wrapper = styled(PageContent)`
  max-width: 550px;
  margin-inline: auto;
  padding-top: 100px;
  justify-content: space-between;
  overflow-y: hidden;
  gap: 64px;
`

export const LightningIconWrapper = styled.div`
  font-size: 20px;
`

export const ContentWrapper = styled(VStack)`
  padding: 24px;
  background: rgba(92, 167, 255, 0.03);
  border-top: 1px dashed ${getColor('foregroundExtra')};
  border-bottom: 1px dashed ${getColor('foregroundExtra')};
  gap: 24px;
  font-size: 24px;
  ${borderRadius.s};
`

export const PillWrapper = styled(HStack)`
  position: relative;
  padding: 8px 12px;
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 0px 9999px 9999px 0px;
  max-width: fit-content;
  border-left: 2px solid ${getColor('foregroundDark')};

  &:before {
    content: '';
    position: absolute;
    left: -2px;
    bottom: -463px;
    height: 463px;
    width: 2px;
    background-color: ${getColor('foreground')};
  }
`

export const SummaryListItem = styled(HStack)`
  position: relative;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};

  &:before {
    content: '';
    position: absolute;
    width: 23px;
    height: 2px;
    background-color: ${getColor('foregroundDark')};
    top: 50%;
    left: -24px;
    transform: translateY(-50%);
  }
`

export const IconWrapper = styled(VStack)`
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #4879fd;
`
