import { centeredContentColumn } from '@lib/ui/css/centeredContentColumn'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import styled from 'styled-components'

export const PageContent = styled(VStack)`
  ${horizontalPadding(pageConfig.horizontalPadding)};
  ${verticalPadding(pageConfig.verticalPadding)};
  flex-grow: 1;
`

interface FitPageContentProps {
  contentMaxWidth?: number
}

export const FitPageContent = styled.div<FitPageContentProps>`
  ${({ contentMaxWidth = 720 }) =>
    centeredContentColumn({
      contentMaxWidth,
      horizontalMinPadding: pageConfig.horizontalPadding,
    })}
  ${verticalPadding(pageConfig.verticalPadding)};
  flex-grow: 1;
`
