import { centeredContentColumn } from '@lib/ui/css/centeredContentColumn'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import styled, { css } from 'styled-components'

export const pageBottomInsetVar = '--page-bottom-inset'
const pageBottomInset = `var(${pageBottomInsetVar}, 0px)`

const withPageBottomInsetPadding = css`
  padding-bottom: calc(${pageConfig.verticalPadding}px + ${pageBottomInset});
  @supports (padding-bottom: calc(0px + env(safe-area-inset-bottom))) {
    padding-bottom: calc(
      ${pageConfig.verticalPadding}px + ${pageBottomInset} +
        env(safe-area-inset-bottom)
    );
  }
`

export const PageContent = styled(VStack)`
  ${horizontalPadding(pageConfig.horizontalPadding)};
  ${verticalPadding(pageConfig.verticalPadding)};
  ${withPageBottomInsetPadding};
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
  ${withPageBottomInsetPadding};
  flex-grow: 1;
  overflow: auto;
  min-height: 0;
`

export const FitPageContent = styled.div<FitPageContentParams>`
  ${({ contentMaxWidth }) => fitPageContent({ contentMaxWidth })}
`
