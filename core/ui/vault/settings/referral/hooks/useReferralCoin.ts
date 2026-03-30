import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'

import { useCurrentVaultCoin } from '../../../state/currentVaultCoins'

export const useReferralCoin = () => {
  return useCurrentVaultCoin(chainFeeCoin.THORChain)
}
