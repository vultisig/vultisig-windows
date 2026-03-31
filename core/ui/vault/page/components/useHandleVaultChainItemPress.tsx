import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { Chain } from '@vultisig/core-chain/Chain'

type Input = {
  chain: string
}

export const useHandleVaultChainItemPress = ({ chain }: Input) => {
  const navigate = useCoreNavigate()

  return {
    onClick: () => {
      navigate({ id: 'vaultChainDetail', state: { chain: chain as Chain } })
    },
  }
}
