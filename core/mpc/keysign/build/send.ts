import { create } from '@bufbuild/protobuf'
import { isChainOfKind } from '@core/chain/ChainKind'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getFeeQuote } from '@core/chain/feeQuote'
import { getPublicKey } from '@core/chain/publicKey/getPublicKey'
import { buildChainSpecific } from '@core/mpc/keysign/chainSpecific/build'
import { refineKeysignAmount } from '@core/mpc/keysign/refine/amount'
import { refineKeysignUtxo } from '@core/mpc/keysign/refine/utxo'
import { getKeysignTxData } from '@core/mpc/keysign/txData'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Vault } from '@core/mpc/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { WalletCore } from '@trustwallet/wallet-core'

type BuildSendKeysignPayloadInput = {
  coin: AccountCoin
  receiver: string
  amount: bigint
  memo: string | undefined
  vault: Pick<Vault, 'hexChainCode' | 'publicKeys' | 'localPartyId' | 'libType'>
  walletCore: WalletCore
  balance: bigint
}

export const buildSendKeysignPayload = async ({
  coin,
  receiver,
  amount,
  memo,
  vault,
  walletCore,
  balance,
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

  const publicKey = getPublicKey({
    chain: coin.chain,
    walletCore,
    hexChainCode: vault.hexChainCode,
    publicKeys: vault.publicKeys,
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
    vaultLocalPartyId: vault.localPartyId,
    vaultPublicKeyEcdsa: vault.publicKeys.ecdsa,
    libType: vault.libType,
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
