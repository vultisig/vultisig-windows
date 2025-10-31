import { Chain } from '@core/chain/Chain'
import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'

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
