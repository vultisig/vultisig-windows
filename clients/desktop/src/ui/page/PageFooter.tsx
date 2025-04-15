import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { pageConfig } from '@lib/ui/page/config'
import styled from 'styled-components'

import { PageSlice } from './PageSlice'

export const PageFooter = styled(PageSlice)`
  padding-bottom: ${toSizeUnit(pageConfig.verticalPadding)};
`
