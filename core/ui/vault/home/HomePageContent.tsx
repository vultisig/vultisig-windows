import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { PageContent } from '@lib/ui/page/PageContent'
import styled, { css } from 'styled-components'

/** Shared with the floating header layer so it lines up with each page's slot. */
export const HomePageContent = styled(PageContent)<{ $isExtension: boolean }>`
  ${hideScrollbars};
  position: relative;

  ${({ $isExtension, theme }) =>
    $isExtension
      ? css`
          gap: 20px;
          padding-top: 32px;
        `
      : theme.iconStyle === 'station' &&
        css`
          gap: 20px;
          padding-top: 24px;
        `}
`
