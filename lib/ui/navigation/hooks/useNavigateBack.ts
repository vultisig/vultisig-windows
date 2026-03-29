import { useCallback } from 'react'

import { useNavigation } from '../state'

/**
 * Pops one or more views from the navigation history stack (never below the root view).
 */
export const usePopNavigationHistory = () => {
  const [, setState] = useNavigation()

  return useCallback(
    (steps: number) => {
      setState(state => {
        const stepsToPop = Math.min(
          steps,
          Math.max(0, state.history.length - 1)
        )
        if (stepsToPop <= 0) {
          return state
        }

        return {
          ...state,
          history: state.history.slice(0, -stepsToPop),
        }
      })
    },
    [setState]
  )
}

export const useNavigateBack = () => {
  const popNavigationHistory = usePopNavigationHistory()

  return useCallback(() => {
    popNavigationHistory(1)
  }, [popNavigationHistory])
}
