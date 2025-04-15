import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { VStack } from '@lib/ui/layout/Stack'
import { pageConfig } from '@lib/ui/page/config'
import styled from 'styled-components'

export const PageSlice = styled(VStack)`
  width: 100%;
  ${horizontalPadding(pageConfig.horizontalPadding)};
`
