import { Chain } from '@core/chain/Chain'
import { getCoinType } from '@core/chain/coin/coinType'
import { WalletCore } from '@trustwallet/wallet-core'

type DeriveAddressFromMnemonicInput = {
  chain: Chain
  mnemonic: string
  walletCore: WalletCore
}

export const deriveAddressFromMnemonic = ({
  chain,
  mnemonic,
  walletCore,
}: DeriveAddressFromMnemonicInput): string => {
  const hdWallet = walletCore.HDWallet.createWithMnemonic(mnemonic, '')

  const coinType = getCoinType({ chain, walletCore })
  const address = hdWallet.getAddressForCoin(coinType)

  hdWallet.delete()

  return address
}
