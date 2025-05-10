import { useCoreViewState } from '../../navigation/hooks/useCoreViewState'

export const useCurrentVaultChain = () => {
  const [{ chain }] = useCoreViewState<'vaultChainDetail'>()

  return chain
}
