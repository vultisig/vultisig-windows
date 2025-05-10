import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'

export const useCurrentDepositCoin = () => {
  return useCoreViewState<'deposit'>()
}
