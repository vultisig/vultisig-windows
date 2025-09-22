import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { getPsbtTransferInfo } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { UTXOSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Vault } from '@core/ui/vault/Vault'
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual'
import { WalletCore } from '@trustwallet/wallet-core'
import { Psbt } from 'bitcoinjs-lib'

import { restrictPsbtToInputs } from './restrictPsbt'

type GetPsbtKeysignPayloadInput = {
  psbt: Psbt
  walletCore: WalletCore
  vault: Vault
  coin: AccountCoin
  chainSpecific: KeysignChainSpecific
  params?: Record<string, any>[]
  skipBroadcast?: boolean
}
export const getPsbtKeysignPayload = ({
  psbt,
  walletCore,
  vault,
  coin,
  chainSpecific,
  params,
  skipBroadcast,
}: GetPsbtKeysignPayloadInput): KeysignPayload => {
  const { recipient, sendAmount } = getPsbtTransferInfo(psbt, coin.address)

  const publicKey = getPublicKey({
    chain: Chain.Bitcoin,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
  })

  if (params && params.length > 0) {
    const currentWalletEntries = params.filter(e =>
      areLowerCaseEqual(e.address, coin.address)
    )
    if (currentWalletEntries.length === 0) {
      throw new Error('No entries for wallet address')
    }
    ;(chainSpecific.value as UTXOSpecific).psbt = restrictPsbtToInputs(
      psbt,
      currentWalletEntries.map(p => ({
        signingIndexes: p.signingIndexes,
        sigHash: p.sigHash,
      })),
      Buffer.from(publicKey.data())
    ).toBase64()
  }

  const keysignPayload = create(KeysignPayloadSchema, {
    toAddress: recipient,
    toAmount: sendAmount.toString(),
    vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
    vaultLocalPartyId: 'VultiConnect',
    coin,
    blockchainSpecific: chainSpecific,
    memo: '',
    skipBroadcast,
  })

  return keysignPayload
}
