import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { verticalPadding } from '@lib/ui/css/verticalPadding'
import { VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import styled from 'styled-components'

export const PageFooter = styled(VStack)`
  ${horizontalPadding(pageConfig.horizontalPadding)};
  ${verticalPadding(pageConfig.verticalPadding)};
`
