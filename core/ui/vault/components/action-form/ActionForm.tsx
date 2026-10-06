import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { pageConfig } from '@lib/ui/page/config'
import { PageContent } from '@lib/ui/page/PageContent'
import styled from 'styled-components'

export const ActionForm = styled(PageContent)`
  width: min(${pageConfig.actionColumnWidth}px, 100%);
  margin-inline: auto;
  ${hideScrollbars}
`
