import styled from 'styled-components'

/** Name of the CSS variable holding the floating header's measured height. */
export const homeHeaderHeightVar = '--home-header-height'

/**
 * The room a home page keeps at the top of its scroll content for the header
 * that floats over both pages; the header follows it as the page scrolls.
 */
export const HomeHeaderSlot = styled.div`
  flex-shrink: 0;
  height: var(${homeHeaderHeightVar}, 0px);
`
