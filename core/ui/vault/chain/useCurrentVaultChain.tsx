import { useCorePathParams } from '../../navigation/hooks/useCorePathParams'

export const useCurrentVaultChain = () => {
  const [{ chain }] = useCorePathParams<'vaultChainDetail'>()

  return chain
}
