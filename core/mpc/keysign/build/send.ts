import { create } from '@bufbuild/protobuf'
import { isChainOfKind } from '@core/chain/ChainKind'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { FeeSettings } from '@core/chain/feeQuote/settings/core'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { refineKeysignAmount } from '@core/mpc/keysign/refine/amount'
import { refineKeysignUtxo } from '@core/mpc/keysign/refine/utxo'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

import { MpcLib } from '../../mpcLib'
import { getKeysignUtxoInfo } from '../utxo/getKeysignUtxoInfo'

export type BuildSendKeysignPayloadInput = {
  coin: AccountCoin
  receiver: string
  amount: bigint
  memo?: string
  vaultId: string
  localPartyId: string
  publicKey: PublicKey
  libType: MpcLib
  walletCore: WalletCore
  feeSettings?: FeeSettings
}

export const buildSendKeysignPayload = async ({
  coin,
  receiver,
  amount,
  memo,
  vaultId,
  localPartyId,
  publicKey,
  walletCore,
  libType,
  feeSettings,
}: BuildSendKeysignPayloadInput) => {
  const keysignPayload = create(KeysignPayloadSchema, {
    coin: toCommCoin({
      ...coin,
      hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
    }),
    toAddress: receiver,
    toAmount: amount.toString(),
    memo,
    vaultLocalPartyId: localPartyId,
    vaultPublicKeyEcdsa: vaultId,
    libType,
    utxoInfo: await getKeysignUtxoInfo(coin),
  })

  keysignPayload.blockchainSpecific = await getChainSpecific({
    keysignPayload,
    feeSettings,
  })

  let refinedPayload = await refineKeysignAmount({
    keysignPayload,
    walletCore,
    publicKey,
  })

  if (isChainOfKind(coin.chain, 'utxo')) {
    refinedPayload = refineKeysignUtxo({
      keysignPayload: refinedPayload,
      walletCore,
      publicKey,
    })
  }

  return refinedPayload
}
