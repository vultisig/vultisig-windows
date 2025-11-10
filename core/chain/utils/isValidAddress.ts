import { Chain } from '@core/chain/Chain'
import { getCoinType } from '@core/chain/coin/coinType'
import { attempt } from '@lib/utils/attempt'
import { WalletCore } from '@trustwallet/wallet-core'
import { bech32m } from 'bech32'

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

  if (chain === Chain.Zcash && address.toLowerCase().startsWith('tex1')) {
    const { data } = attempt(() => bech32m.decode(address))
    return !!data
  }

  return walletCore.AnyAddress.isValid(address, coinType)
}
