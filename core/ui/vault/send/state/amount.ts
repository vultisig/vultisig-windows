import { useCallback } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'

export const useSendAmount = () => {
  const [state, setState] = useCoreViewState<'send'>()

  const setAmount = useCallback(
    (amount: bigint | null | ((prev: bigint | null) => bigint | null)) => {
      setState(prev => ({
        ...prev,
        amount:
          typeof amount === 'function'
            ? (amount(prev.amount ?? null) ?? undefined)
            : (amount ?? undefined),
      }))
    },
    [setState]
  )

  return [state.amount ?? null, setAmount] as const
}
