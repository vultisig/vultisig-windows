import { useAppPathParams } from '../../navigation/hooks/useAppPathParams'

export const useCurrentVaultChain = () => {
  const [{ chain }] = useAppPathParams<'vaultChainDetail'>()

  return chain
}
