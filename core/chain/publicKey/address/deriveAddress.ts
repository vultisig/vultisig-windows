import { Chain } from '@core/chain/Chain'
import { getCoinType } from '@core/chain/coin/coinType'
import {
  PublicKey,
  WalletCore,
} from '@trustwallet/wallet-core/dist/src/wallet-core'

import { deriveCardanoAddress } from './cardano'

type DeriveAddressInput = {
  chain: Chain
  publicKey: PublicKey
  walletCore: WalletCore
}

const bitcoinCashPrefix = 'bitcoincash:'

export const deriveAddress = ({
  chain,
  publicKey,
  walletCore,
}: DeriveAddressInput) => {
  const coinType = getCoinType({
    chain,
    walletCore,
  })

  if (chain === Chain.MayaChain) {
    return walletCore.AnyAddress.createBech32WithPublicKey(
      publicKey,
      coinType,
      'maya'
    ).description()
  }

  if (chain === Chain.Cardano) {
    return deriveCardanoAddress({
      publicKey,
      walletCore,
    })
  }

  const address = walletCore.CoinTypeExt.deriveAddressFromPublicKey(
    coinType,
    publicKey
  )

  if (chain === Chain.BitcoinCash && address.startsWith(bitcoinCashPrefix)) {
    return address.slice(bitcoinCashPrefix.length)
  }

  return address
}
