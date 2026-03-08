import { Chain } from '@core/chain/Chain'
import { isMoneroAddress } from '@core/chain/chains/monero/isMoneroAddress'
import { isZcashShieldedAddress } from '@core/chain/chains/zcash/isZcashShieldedAddress'
import { getCoinType } from '@core/chain/coin/coinType'
import { WalletCore } from '@trustwallet/wallet-core'

type Input = {
  chain: Chain
  address: string
  walletCore: WalletCore
}

export const isValidAddress = ({ chain, address, walletCore }: Input) => {
  if (chain === Chain.Monero) {
    return isMoneroAddress(address)
  }

  if (chain === Chain.ZcashShielded || chain === Chain.Zcash) {
    if (isZcashShieldedAddress(address)) return true
    if (chain === Chain.ZcashShielded) return false
  }

  const coinType = getCoinType({
    walletCore,
    chain,
  })

  if (chain === Chain.MayaChain) {
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
