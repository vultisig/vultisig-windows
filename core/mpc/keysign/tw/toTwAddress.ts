import { Chain } from '@core/chain/Chain'
import { getCoinType } from '@core/chain/coin/coinType'
import { WalletCore } from '@trustwallet/wallet-core'

type ToTwAddressInput = {
  address: string
  walletCore: WalletCore
  chain: Chain
}

export const toTwAddress = ({
  address,
  walletCore,
  chain,
}: ToTwAddressInput) => {
  const coinType = getCoinType({
    walletCore,
    chain,
  })

  if (chain === Chain.MayaChain) {
    return walletCore.AnyAddress.createBech32(address, coinType, 'maya').data()
  }

  return walletCore.AnyAddress.createWithString(address, coinType).data()
}
