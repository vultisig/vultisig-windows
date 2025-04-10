import { horizontalPadding } from '@lib/ui/css/horizontalPadding'
import { VStack } from '@lib/ui/layout/Stack'
import styled from 'styled-components'

import { pageConfig } from './config'

export const PageSlice = styled(VStack)`
  width: 100%;
  ${horizontalPadding(pageConfig.horizontalPadding)};
`
