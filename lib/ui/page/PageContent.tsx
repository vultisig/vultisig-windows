import { centeredContentColumn } from '@lib/ui/css/centeredContentColumn'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import styled, { css } from 'styled-components'

export const PageContent = styled(VStack)`
  ${horizontalPadding(pageConfig.horizontalPadding)};
  ${verticalPadding(pageConfig.verticalPadding)};
  flex-grow: 1;
`

type FitPageContentParams = {
  contentMaxWidth?: number
}

export const fitPageContent = ({
  contentMaxWidth = 720,
}: FitPageContentParams = {}) => css`
  ${centeredContentColumn({
    contentMaxWidth,
    horizontalMinPadding: pageConfig.horizontalPadding,
  })}
  ${verticalPadding(pageConfig.verticalPadding)};
  flex-grow: 1;
  overflow: auto;
  min-height: 0;
`

export const FitPageContent = styled.div<FitPageContentParams>`
  ${({ contentMaxWidth }) => fitPageContent({ contentMaxWidth })}
`
