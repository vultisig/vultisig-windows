import styled from 'styled-components'

/** Name of the CSS variable holding the floating header's measured height. */
export const homeHeaderHeightVar = '--home-header-height'

/** Room at the top of a page's scroll content for the floating header, which follows it. */
export const HomeHeaderSlot = styled.div`
  flex-shrink: 0;
  height: var(${homeHeaderHeightVar}, 0px);
`
