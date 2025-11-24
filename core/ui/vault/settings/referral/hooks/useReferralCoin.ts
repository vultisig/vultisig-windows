import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

import { useCurrentVaultCoin } from '../../../state/currentVaultCoins'

export const useReferralCoin = () => {
  return useCurrentVaultCoin(chainFeeCoin.THORChain)
}
