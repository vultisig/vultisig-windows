import { getSpendableBalance } from '@core/chain/chains/zcash/scanner'
import { getZcashVaultData } from '@core/chain/chains/zcash/zcashVaultData'

import { CoinBalanceResolver } from '../resolver'

export const getZcashSaplingCoinBalance: CoinBalanceResolver = async () => {
  const vaultData = getZcashVaultData()
  if (!vaultData) return BigInt(0)

  return getSpendableBalance(vaultData.publicKeyEcdsa)
}
