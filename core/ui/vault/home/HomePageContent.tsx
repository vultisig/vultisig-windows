import { hideScrollbars } from '@lib/ui/css/hideScrollbars'
import { PageContent } from '@lib/ui/page/PageContent'
import styled, { css } from 'styled-components'

/**
 * Padding and spacing shared by both home pages and the header layer that
 * floats over them, so the header lines up with each page's slot.
 */
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
