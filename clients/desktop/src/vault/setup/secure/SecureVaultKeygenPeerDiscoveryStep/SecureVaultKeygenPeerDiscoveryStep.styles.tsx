import styled from 'styled-components'

import { borderRadius } from '../../../../lib/ui/css/borderRadius'
import { centeredContentColumn } from '../../../../lib/ui/css/centeredContentColumn'
import { verticalPadding } from '../../../../lib/ui/css/verticalPadding'
import { HStack, VStack } from '../../../../lib/ui/layout/Stack'
import { getColor } from '../../../../lib/ui/theme/getters'
import { pageConfig } from '../../../../ui/page/config'

export const InfoIconWrapperForBanner = styled(HStack)`
  align-items: center;
  color: ${getColor('textShy')};
`

export const CloseIconWrapper = styled.div`
  font-size: 12px;
  padding: 4px 4px;
  padding-bottom: 1px;
  border-radius: 24px;
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

export const PageWrapper = styled.div`
  ${centeredContentColumn({
    contentMaxWidth: 720,
    horizontalMinPadding: pageConfig.horizontalPadding,
  })}
  ${verticalPadding(pageConfig.verticalPadding)};
  flex-grow: 1;
`
