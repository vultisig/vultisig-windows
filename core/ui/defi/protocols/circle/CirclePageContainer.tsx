import { fitPageContent, pageBottomInsetVar } from '@lib/ui/page/PageContent'
import styled from 'styled-components'

const pageBottomInset = `var(${pageBottomInsetVar}, 0px)`

export const CirclePageContainer = styled.div`
  ${fitPageContent({ contentMaxWidth: 400 })}
  padding-bottom: calc(40px + ${pageBottomInset});
  @supports (padding-bottom: calc(0px + env(safe-area-inset-bottom))) {
    padding-bottom: calc(
      40px + ${pageBottomInset} + env(safe-area-inset-bottom)
    );
  }
`
