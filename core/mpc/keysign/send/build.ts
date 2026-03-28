import { create } from '@bufbuild/protobuf'
import { isChainOfKind } from '@core/chain/ChainKind'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getCoinBalance } from '@core/chain/coin/balance'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { FeeSettings } from '@core/mpc/keysign/chainSpecific/FeeSettings'
import { refineKeysignAmount } from '@core/mpc/keysign/refine/amount'
import { refineKeysignUtxo } from '@core/mpc/keysign/refine/utxo'
import { getKeysignUtxoInfo } from '@core/mpc/keysign/utxo/getKeysignUtxoInfo'
import { KeysignLibType } from '@core/mpc/mpcLib'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

export type BuildSendKeysignPayloadInput = {
  coin: AccountCoin
  receiver: string
  amount: bigint
  memo?: string
  vaultId: string
  localPartyId: string
  publicKey: PublicKey | null
  libType: KeysignLibType
  walletCore: WalletCore
  feeSettings?: FeeSettings
  /** Hex public key override for chains that don't use WalletCore (e.g. MLDSA). */
  hexPublicKeyOverride?: string
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
  hexPublicKeyOverride,
}: BuildSendKeysignPayloadInput) => {
  const hexPublicKey =
    hexPublicKeyOverride ??
    Buffer.from(shouldBePresent(publicKey, 'PublicKey').data()).toString('hex')

  let keysignPayload = create(KeysignPayloadSchema, {
    coin: toCommCoin({
      ...coin,
      hexPublicKey,
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
    walletCore,
  })

  const balance = await getCoinBalance(coin)

  keysignPayload = refineKeysignAmount({
    keysignPayload,
    walletCore,
    publicKey,
    balance,
  })

  if (isChainOfKind(coin.chain, 'utxo')) {
    keysignPayload = refineKeysignUtxo({
      keysignPayload,
      walletCore,
      publicKey,
    })
  }

  return keysignPayload
}
