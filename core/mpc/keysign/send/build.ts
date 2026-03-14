import { create } from '@bufbuild/protobuf'
import { Chain } from '@core/chain/Chain'
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
  console.log(
    '[buildSendKeysignPayload] START chain:',
    coin.chain,
    'amount:',
    amount.toString()
  )

  const hexPublicKey =
    hexPublicKeyOverride ?? Buffer.from(publicKey!.data()).toString('hex')
  console.log(
    '[buildSendKeysignPayload] hexPublicKey:',
    hexPublicKey.substring(0, 16) + '...'
  )

  const utxoInfo = await getKeysignUtxoInfo(coin)
  console.log(
    '[buildSendKeysignPayload] utxo info:',
    utxoInfo ? 'present' : 'undefined'
  )

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
    utxoInfo,
  })

  console.log(
    '[buildSendKeysignPayload] payload created, getting chain specific...'
  )
  try {
    keysignPayload.blockchainSpecific = await getChainSpecific({
      keysignPayload,
      feeSettings,
      walletCore,
    })
    console.log(
      '[buildSendKeysignPayload] chain specific done:',
      keysignPayload.blockchainSpecific.case,
      JSON.stringify(keysignPayload.blockchainSpecific.value)
    )
  } catch (err) {
    console.error('[buildSendKeysignPayload] getChainSpecific FAILED:', err)
    throw err
  }

  if (coin.chain !== Chain.Monero) {
    const balance = await getCoinBalance(coin)

    keysignPayload = refineKeysignAmount({
      keysignPayload,
      walletCore,
      publicKey: publicKey!,
      balance,
    })

    if (isChainOfKind(coin.chain, 'utxo')) {
      keysignPayload = refineKeysignUtxo({
        keysignPayload,
        walletCore,
        publicKey: publicKey!,
      })
    }
  }

  return keysignPayload
}
