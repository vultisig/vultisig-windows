import { Chain } from '@core/chain/Chain'
import { getCoinType } from '@core/chain/coin/coinType'
import { WalletCore } from '@trustwallet/wallet-core'

type Input = {
  chain: Chain
  address: string
  walletCore: WalletCore
}

export const isValidAddress = ({ chain, address, walletCore }: Input) => {
  const coinType = getCoinType({
    walletCore,
    chain,
  })

  if (chain === Chain.MayaChain) {
    // MayaChain is Cosmos-style Bech32. Accept common account + validator address forms.
    const mayaHrps = [
      'maya',
      'mayavaloper',
      'mayavalcons',
      'mayavaloperpub',
      'mayavalconspub',
    ] as const

    const a = address.trim()

    return mayaHrps.some(hrp =>
      walletCore.AnyAddress.isValidBech32(a, coinType, hrp)
    )
  }

  return walletCore.AnyAddress.isValid(address, coinType)
}
