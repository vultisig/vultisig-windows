import { Transition } from 'framer-motion'

// iOS reference: spring(response: 0.5, dampingFraction: 0.72) with mass 1,
// so stiffness = (2π / response)² and damping = 2 · ratio · (2π / response).
const tabSwitchAngularFrequency = (2 * Math.PI) / 0.5
const tabSwitchDampingRatio = 0.72

/** A tab tap: lands slightly past the tab and settles back. */
export const tabSwitchTransition: Transition = {
  type: 'spring',
  stiffness: tabSwitchAngularFrequency ** 2,
  damping: 2 * tabSwitchDampingRatio * tabSwitchAngularFrequency,
  mass: 1,
}
