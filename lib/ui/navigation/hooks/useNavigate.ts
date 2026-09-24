import { updateAtIndex } from '@vultisig/lib-utils/array/updateAtIndex'
import { useCallback } from 'react'

import { useNavigation } from '../state'
import { View } from '../View'

type NavigateOptions = {
  replace?: boolean
  /** Drops the whole history so the view becomes the only entry. */
  reset?: boolean
}

export function useNavigate<T extends View = View>() {
  const [, setState] = useNavigation()

  return useCallback(
    (view: T, options: NavigateOptions = {}) => {
      const { replace, reset } = options

      setState(prev => {
        if (reset) {
          return { ...prev, history: [view] }
        }

        if (replace) {
          return {
            ...prev,
            history: updateAtIndex(
              prev.history,
              prev.history.length - 1,
              () => view
            ),
          }
        }

        return {
          ...prev,
          history: [...prev.history, view],
        }
      })
    },
    [setState]
  )
}
