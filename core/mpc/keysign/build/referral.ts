import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { isChainOfKind } from '@core/chain/ChainKind'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getCoinBalance } from '@core/chain/coin/balance'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { refineKeysignAmount } from '@core/mpc/keysign/refine/amount'
import { refineKeysignUtxo } from '@core/mpc/keysign/refine/utxo'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

import { MpcLib } from '../../mpcLib'
import { getKeysignUtxoInfo } from '../utxo/getKeysignUtxoInfo'

export type BuildReferralKeysignPayloadInput = {
  coin: AccountCoin
  memo: string
  amount: number
  vaultId: string
  localPartyId: string
  publicKey: PublicKey
  libType: MpcLib
  walletCore: WalletCore
}

export const buildReferralKeysignPayload = async ({
  coin,
  memo,
  amount,
  vaultId,
  localPartyId,
  publicKey,
  libType,
  walletCore,
}: BuildReferralKeysignPayloadInput) => {
  let keysignPayload = create(KeysignPayloadSchema, {
    coin: toCommCoin({
      ...coin,
      hexPublicKey: Buffer.from(publicKey.data()).toString('hex'),
    }),
    memo,
    toAmount: toChainAmount(amount, coin.decimals).toString(),
    vaultLocalPartyId: localPartyId,
    vaultPublicKeyEcdsa: vaultId,
    libType,
    utxoInfo: await getKeysignUtxoInfo(coin),
  })

  keysignPayload.blockchainSpecific = await getChainSpecific({
    keysignPayload,
    isDeposit: true,
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
