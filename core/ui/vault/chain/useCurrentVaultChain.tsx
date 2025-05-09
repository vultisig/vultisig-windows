import { useCorePathState } from '../../navigation/hooks/useCorePathState'

export const useCurrentVaultChain = () => {
  const [{ chain }] = useCorePathState<'vaultChainDetail'>()

  return chain
}
