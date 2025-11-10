import { Chain } from '@core/chain/Chain'
import { getCoinType } from '@core/chain/coin/coinType'
import { attempt } from '@lib/utils/attempt'
import { WalletCore } from '@trustwallet/wallet-core'

import { fromBech32mAddress, isBech32mAddress } from './bech32mAddress'

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
    return walletCore.AnyAddress.isValidBech32(address, coinType, 'maya')
  }

  if (chain === Chain.Zcash && isBech32mAddress(address)) {
    const { data } = attempt(() => fromBech32mAddress(address))
    return !!data
  }

  return walletCore.AnyAddress.isValid(address, coinType)
}
