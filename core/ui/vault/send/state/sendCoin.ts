import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'

export const useCurrentSendCoin = () => {
  const [state, setState] = useCoreViewState<'send'>()

  const currentState = {
    ...state,
    coin: shouldBePresent(state.coin),
  }

  return [currentState, setState] as const
}
