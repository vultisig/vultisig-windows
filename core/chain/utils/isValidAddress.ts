import { Chain } from '@core/chain/Chain'
import { getCoinType } from '@core/chain/coin/coinType'
import { WalletCore } from '@trustwallet/wallet-core'

type Input = {
  chain: Chain
  address: string
  walletCore: WalletCore
}

const customPrefixes: Partial<Record<Chain, string>> = {
  [Chain.MayaChain]: 'maya',
  [Chain.Zcash]: 'tex',
}

export const isValidAddress = ({ chain, address, walletCore }: Input) => {
  const coinType = getCoinType({
    walletCore,
    chain,
  })

  const customPrefix = customPrefixes[chain]
  if (customPrefix && address.toLowerCase().startsWith(customPrefix)) {
    return walletCore.AnyAddress.isValidBech32(address, coinType, customPrefix)
  }

  return walletCore.AnyAddress.isValid(address, coinType)
}
