import { pageConfig } from '@clients/extension/src/components/shared/Page/config'
import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { VStack } from '@lib/ui/layout/Stack'
import styled from 'styled-components'

export const PageContent = styled(VStack)`
  ${horizontalPadding(pageConfig.horizontalPadding)};
  ${verticalPadding(pageConfig.verticalPadding)};
  flex-grow: 1;
`
