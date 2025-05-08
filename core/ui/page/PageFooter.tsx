import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { pageConfig } from '@lib/ui/page/config'
import { PageSlice } from '@lib/ui/page/PageSlice'
import styled from 'styled-components'

export const PageFooter = styled(PageSlice)`
  padding-bottom: ${toSizeUnit(pageConfig.verticalPadding)};
`
