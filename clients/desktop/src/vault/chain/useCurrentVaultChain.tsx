import { useAppPathParams } from '@lib/ui/navigation/hooks/useAppPathParams'

export const useCurrentVaultChain = () => {
  const [{ chain }] = useAppPathParams<'vaultChainDetail'>()

  return chain
}
