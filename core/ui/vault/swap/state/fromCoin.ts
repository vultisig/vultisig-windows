import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'

export const useFromCoin = () => {
  return useCoreViewState<'swap'>()
}
