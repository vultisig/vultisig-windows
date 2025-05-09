import { updateAtIndex } from '@lib/utils/array/updateAtIndex'
import { ReactNode, useCallback } from 'react'

import { getStateProviderSetup } from '../state/getStateProviderSetup'

type HistoryEntry = {
  id: string
  state?: any
}

type NavigationState = {
  history: HistoryEntry[]
  currentIndex: number
}

export const { useState: useNavigation, provider: NavigationProvider } =
  getStateProviderSetup<NavigationState>('Navigation')

export type NavigateInput = {
  replace?: boolean
  state?: any
  id: string
}

export const useNavigate = () => {
  const [, setState] = useNavigation()

  return useCallback(
    ({ id, state, replace }: NavigateInput) => {
      setState(prev => {
        if (replace) {
          return {
            ...prev,
            history: updateAtIndex(prev.history, prev.currentIndex, () => ({
              id,
              state,
            })),
          }
        }

        const newHistory = [...prev.history, { id, state }]

        return {
          history: newHistory,
          currentIndex: newHistory.length - 1,
        }
      })
    },
    [setState]
  )
}

export const useNavigateBack = () => {
  const [, setState] = useNavigation()

  return useCallback(() => {
    setState(state => {
      if (state.currentIndex <= 0) {
        return state
      }

      return {
        ...state,
        currentIndex: state.currentIndex - 1,
      }
    })
  }, [setState])
}

export const useRouteState = () => {
  const [state] = useNavigation()

  return state.history[state.currentIndex].state
}

export type Routes<T extends string = string> = Record<T, () => ReactNode>

type ActiveRouteProps = {
  routes: Routes
}

export const ActiveRoute = ({ routes }: ActiveRouteProps) => {
  const [state] = useNavigation()

  return routes[state.history[state.currentIndex].id]()
}
