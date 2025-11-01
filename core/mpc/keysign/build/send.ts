import { create } from '@bufbuild/protobuf'
import { isChainOfKind } from '@core/chain/ChainKind'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getFeeQuote } from '@core/chain/feeQuote'
import { buildChainSpecific } from '@core/mpc/keysign/chainSpecific/build'
import { refineKeysignAmount } from '@core/mpc/keysign/refine/amount'
import { refineKeysignUtxo } from '@core/mpc/keysign/refine/utxo'
import { getKeysignTxData } from '@core/mpc/keysign/txData'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

import { MpcLib } from '../../mpcLib'

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
  balance: bigint
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
  balance,
  libType,
}: BuildSendKeysignPayloadInput) => {
  const txData = await getKeysignTxData({
    coin,
    amount: shouldBePresent(amount),
    receiver,
  })

  const feeQuote = await getFeeQuote({
    coin,
    receiver,
    amount: shouldBePresent(amount),
    data: memo,
  })

  const blockchainSpecific = buildChainSpecific({
    chain: coin.chain,
    txData,
    feeQuote,
  })

  const keysignPayload = create(KeysignPayloadSchema, {
    coin: toCommCoin({
      ...coin,
      hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
    }),
    toAddress: receiver,
    toAmount: shouldBePresent(amount).toString(),
    blockchainSpecific,
    memo,
    vaultLocalPartyId: localPartyId,
    vaultPublicKeyEcdsa: vaultId,
    libType,
    utxoInfo: 'utxoInfo' in txData ? txData.utxoInfo : undefined,
  })

  const refiners = [refineKeysignAmount]

  if (isChainOfKind(coin.chain, 'utxo')) {
    refiners.push(refineKeysignUtxo)
  }

  return refiners.reduce(
    (keysignPayload, refiner) =>
      refiner({
        keysignPayload,
        walletCore,
        publicKey,
        balance: shouldBePresent(balance),
      }),
    keysignPayload
  )
}
