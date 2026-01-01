import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { PageContent } from '@lib/ui/page/PageContent'
import styled from 'styled-components'

export const ActionForm = styled(PageContent)`
  width: min(468px, 100%);
  margin-inline: auto;
  overflow: auto;
  ${hideScrollbars}
`
