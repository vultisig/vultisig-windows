import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'

export const useCurrentSendCoin = () => {
  return useCoreViewState<'send'>()
}
