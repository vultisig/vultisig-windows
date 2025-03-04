import styled from 'styled-components'

import { borderRadius } from '../../../../lib/ui/css/borderRadius'
import { HStack, VStack, vStack } from '../../../../lib/ui/layout/Stack'
import { getColor } from '../../../../lib/ui/theme/getters'
import { PageContent } from '../../../../ui/page/PageContent'

export const InfoIconWrapperForBanner = styled.div`
  color: ${getColor('textShy')};
`

export const CloseIconWrapper = styled.div`
  font-size: 12px;
  padding: 4px 6px;
  border-radius: 99px;
  background-color: ${getColor('foregroundExtra')};
`

export const ContentWrapper = styled(VStack)``

export const PillWrapper = styled(HStack)`
  position: relative;
  min-height: 52.5px;
  padding: 12px;
  ${borderRadius.m};
  background-color: ${getColor('foreground')};
  border: 1px solid ${getColor('foregroundExtra')};
`

export const PageWrapper = styled(PageContent)`
  max-width: 800px;
  margin-inline: auto;

  ${vStack({
    gap: 32,
  })};
`

export const LocalPillWrapper = styled(HStack)`
  padding: 12px;
  gap: 12px;
  border: 1px solid #4879fd;
  ${borderRadius.m};
  align-self: stretch;
`

export const CloudOffWrapper = styled.div`
  font-size: 17px;
`
