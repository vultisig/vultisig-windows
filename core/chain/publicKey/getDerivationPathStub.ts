import { Chain } from '@core/chain/Chain'
import { getCoinType } from '@core/chain/coin/coinType'
import { WalletCore } from '@trustwallet/wallet-core'

export const getDerivationPathStub = (
  chain: Chain,
  walletCore: WalletCore
): string => {
  const coinType = getCoinType({ walletCore, chain })
  const fullPath = walletCore.CoinTypeExt.derivationPath(coinType)

  return fullPath.split('/').slice(0, 3).join('/')
}
