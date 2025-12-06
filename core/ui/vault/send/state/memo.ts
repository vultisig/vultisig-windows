import { useCallback } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'

export const useSendMemo = () => {
  const [state, setState] = useCoreViewState<'send'>()

  const setMemo = useCallback(
    (memo: string | ((prev: string) => string)) => {
      setState(prev => ({
        ...prev,
        memo: typeof memo === 'function' ? memo(prev.memo ?? '') : memo,
      }))
    },
    [setState]
  )

  return [state.memo ?? '', setMemo] as const
}
