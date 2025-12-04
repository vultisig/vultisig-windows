import { useCoreViewState } from '../../navigation/hooks/useCoreViewState'

export const useCurrentDefiChain = () => {
  const [{ chain }] = useCoreViewState<'defiChainDetail'>()

  return chain
}
