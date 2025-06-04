import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import styled from 'styled-components'

export const ProgressWrapper = styled(VStack)`
  padding: 16px;
  align-items: center;
`

export const Wrapper = styled(PageContent)`
  overflow-y: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
`

export const DescriptionWrapper = styled.div`
  flex-shrink: 0;
  max-width: 600px;
  margin-inline: auto;
`

export const BottomItemsWrapper = styled.div`
  flex-shrink: 0;
  padding: 16px 0;
  display: flex;
  justify-content: center;
`
