import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

import { useKeysignTxDataQuery } from '../../../../mpc/keysign/txData/query'
import { useCurrentVaultCoin } from '../../../state/currentVaultCoins'

export const useReferralKeysignTxDataQuery = () => {
  const coin = useCurrentVaultCoin(chainFeeCoin.THORChain)

  return useKeysignTxDataQuery({ coin, isDeposit: true })
}
