import { create } from '@bufbuild/protobuf'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { getCoinBalance } from '@core/chain/coin/balance'
import { getChainSpecific } from '@core/mpc/keysign/chainSpecific'
import { refineKeysignAmount } from '@core/mpc/keysign/refine/amount'
import { KeysignLibType } from '@core/mpc/mpcLib'
import { toCommCoin } from '@core/mpc/types/utils/commCoin'
import { KeysignPayloadSchema } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

export type BuildReferralKeysignPayloadInput = {
  coin: AccountCoin
  memo: string
  amount: number
  vaultId: string
  localPartyId: string
  publicKey: PublicKey
  libType: KeysignLibType
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
  })

  keysignPayload.blockchainSpecific = await getChainSpecific({
    keysignPayload,
    walletCore,
    isDeposit: true,
  })

  const balance = await getCoinBalance(coin)

  keysignPayload = refineKeysignAmount({
    keysignPayload,
    walletCore,
    publicKey,
    balance,
  })

  return keysignPayload
}
