import { Serialization } from '@cardano-sdk/core'
import { WalletCore } from '@trustwallet/wallet-core'

type Input = {
  tx: Uint8Array
  walletCore: WalletCore
}

export const getCardanoTxHash = ({ tx, walletCore }: Input): string => {
  const txHex = walletCore.HexCoding.encode(tx)

  const transaction = Serialization.Transaction.fromCbor(
    Serialization.TxCBOR(txHex)
  )

  return transaction.getId()
}
