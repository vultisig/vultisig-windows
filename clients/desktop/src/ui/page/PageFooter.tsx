import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import styled from 'styled-components'

import { pageConfig } from '@lib/ui/page/config'
import { PageSlice } from './PageSlice'

export const PageFooter = styled(PageSlice)`
  padding-bottom: ${toSizeUnit(pageConfig.verticalPadding)};
`
