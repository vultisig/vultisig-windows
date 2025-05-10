import { useCorePathState } from '../../navigation/hooks/useCoreViewState'

export const useCurrentVaultChain = () => {
  const [{ chain }] = useCorePathState<'vaultChainDetail'>()

  return chain
}
