import { create } from '@bufbuild/protobuf'
import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { getPsbtTransferInfo } from '@core/chain/chains/utxo/tx/getPsbtTransferInfo'
import { getUtxos } from '@core/chain/chains/utxo/tx/getUtxos'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { assertChainField } from '@core/chain/utils/assertChainField'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { FeeSettings } from '@core/ui/vault/send/fee/settings/state/feeSettings'
import { Vault } from '@core/ui/vault/Vault'
import { WalletCore } from '@trustwallet/wallet-core'
import { Psbt } from 'bitcoinjs-lib'

type GetPsbtKeysignPayloadInput = {
  psbt: Psbt
  walletCore: WalletCore
  vault: Vault
  feeSettings: FeeSettings | null
  coin: AccountCoin
}

export const getPsbtKeysignPayload = async ({
  psbt,
  walletCore,
  vault,
  feeSettings,
  coin,
}: GetPsbtKeysignPayloadInput): Promise<KeysignPayload> => {
  const { recipient, sendAmount } = getPsbtTransferInfo(psbt, coin.address)

  const chainSpecific = await getChainSpecific({
    coin,
    amount: fromChainAmount(Number(sendAmount) || 0, coin.decimals),
    feeSettings,
    psbt: psbt,
  })

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
