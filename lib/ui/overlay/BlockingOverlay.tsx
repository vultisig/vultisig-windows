import FocusLock from 'react-focus-lock'
import styled from 'styled-components'

import { BodyPortal } from '../dom/BodyPortal'
import { ChildrenProp } from '../props'
import { getColor } from '../theme/getters'

// Above every other body-portalled surface — the highest currently in use is
// the toast layer at 1100.
const zIndex = 2000

const Layer = styled(FocusLock)`
  position: fixed;
  inset: 0;
  z-index: ${zIndex};
  background: ${getColor('background')};
`

/**
 * Full-screen gate that covers the whole app, modals, sheets and toasts
 * included. They portal out of `#root`, whose `isolation: isolate` confines
 * anything rendered inside it, so a gate has to share their layer to cover
 * them. It also takes the focus trap from a modal that was already open —
 * otherwise that modal keeps pulling focus back and the gate cannot be typed
 * into — and returns focus to it once the gate unmounts.
 */
export const BlockingOverlay = ({ children }: ChildrenProp) => (
  <BodyPortal>
    <Layer returnFocus>{children}</Layer>
  </BodyPortal>
)
