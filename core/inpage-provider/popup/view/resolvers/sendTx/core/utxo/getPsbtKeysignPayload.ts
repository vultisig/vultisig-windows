import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
import { getPsbtTransferInfo } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { getUtxos } from '@core/chain/chains/utxo/tx/getUtxos'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { assertChainField } from '@core/chain/utils/assertChainField'
import { KeysignChainSpecific } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Vault } from '@core/ui/vault/Vault'
import { WalletCore } from '@trustwallet/wallet-core'
import { Psbt } from 'bitcoinjs-lib'

type GetPsbtKeysignPayloadInput = {
  psbt: Psbt
  walletCore: WalletCore
  vault: Vault
  coin: AccountCoin
  chainSpecific: KeysignChainSpecific
}

export const getPsbtKeysignPayload = async ({
  psbt,
  walletCore,
  vault,
  coin,
  chainSpecific,
}: GetPsbtKeysignPayloadInput): Promise<KeysignPayload> => {
  const { recipient, sendAmount } = getPsbtTransferInfo(psbt, coin.address)

  const publicKey = getPublicKey({
    chain: Chain.Bitcoin,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
  })

  const keysignPayload = create(KeysignPayloadSchema, {
    toAddress: recipient,
    toAmount: sendAmount.toString(),
    vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
    vaultLocalPartyId: 'VultiConnect',
    coin: toCommCoin({
      ...coin,
      hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
    }),
    blockchainSpecific: chainSpecific,
    utxoInfo: await getUtxos(assertChainField(coin)),
    memo: '',
  })

  return keysignPayload
}
