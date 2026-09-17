import { useCallback } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'

/**
 * The user's choice to pay a TON jetton send's fee in the jetton itself, via
 * the gasless relay. `undefined` until they touch the switch, so the default
 * can follow whether the account holds enough TON for a direct send.
 */
export const useSendTonGaslessPreference = () => {
  const [state, setState] = useCoreViewState<'send'>()

  const setPreference = useCallback(
    (tonGasless: boolean) => {
      setState(prev => ({ ...prev, tonGasless }))
    },
    [setState]
  )

  return [state.tonGasless, setPreference] as const
}
