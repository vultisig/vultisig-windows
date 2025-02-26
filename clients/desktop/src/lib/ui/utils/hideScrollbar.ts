import { css } from '@emotion/react'

export const hideScrollbar = css`
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`
