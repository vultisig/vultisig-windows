import { updateAtIndex } from '@lib/utils/array/updateAtIndex'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useState,
} from 'react'

import { ChildrenProp } from '../props'
import { createContextHook } from '../state/createContextHook'

type HistoryEntry = {
  id: string
  state?: any
}

type RouterState = {
  history: HistoryEntry[]
  historyIndex: number
}

type RouterContextState = RouterState & {
  setState: Dispatch<SetStateAction<RouterState>>
}

const RouterContext = createContext<RouterContextState | undefined>(undefined)

type RouterProviderProps = ChildrenProp & {
  initialHistoryEntry: HistoryEntry
  router: Record<string, () => ReactNode>
}

export const RouterProvider = ({
  children,
  router,
  initialHistoryEntry,
}: RouterProviderProps) => {
  const [state, setState] = useState<RouterState>({
    history: [initialHistoryEntry],
    historyIndex: 0,
  })

  const render = router[state.history[state.historyIndex].id]

  return (
    <RouterContext.Provider value={{ ...state, setState }}>
      {children}
      {render()}
    </RouterContext.Provider>
  )
}

const useRouter = createContextHook(RouterContext, 'RouterContext')

type NavigationOptions = {
  replace?: boolean
}

export const useNavigate = () => {
  const { setState } = useRouter()

  return useCallback(
    (id: string, state?: any, options?: NavigationOptions) => {
      setState(({ history, historyIndex }) => {
        if (options?.replace) {
          return {
            history: updateAtIndex(history, historyIndex, () => ({
              id,
              state,
            })),
            historyIndex,
          }
        }

        return {
          history: [...history, { id, state }],
          historyIndex: history.length + 1,
        }
      })
    },
    [setState]
  )
}

export const useNavigateBack = () => {
  const { setState } = useRouter()

  return useCallback(() => {
    setState(state => {
      if (state.historyIndex <= 0) {
        return state
      }

      return {
        ...state,
        historyIndex: state.historyIndex - 1,
      }
    })
  }, [setState])
}
