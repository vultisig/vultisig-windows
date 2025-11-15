import { Chain, UtxoBasedChain } from '@core/chain/Chain'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { minBigInt } from '@lib/utils/math/minBigInt'
import { WalletCore } from '@trustwallet/wallet-core'
import { PublicKey } from '@trustwallet/wallet-core/dist/src/wallet-core'

import { KeysignPayload } from '../../types/vultisig/keysign/v1/keysign_message_pb'
import { BuildKeysignPayloadError } from '../error'
import { getFeeAmount } from '../fee'
import { getKeysignCoin } from '../utils/getKeysignCoin'

type RefineKeysignAmountInput = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
  publicKey: PublicKey
  balance: bigint
}

export const refineKeysignAmount = (input: RefineKeysignAmountInput) => {
  if (!input.keysignPayload.toAmount) {
    return input.keysignPayload
  }

  const coin = getKeysignCoin(input.keysignPayload)
  if (!isFeeCoin(coin)) {
    return input.keysignPayload
  }

  if (
    isOneOf(coin.chain, Object.values(UtxoBasedChain)) ||
    coin.chain === Chain.Ton
  ) {
    return input.keysignPayload
  }

  const fee = getFeeAmount(input)

  const refinedAmount = minBigInt(
    BigInt(input.keysignPayload.toAmount),
    input.balance - fee
  )

  if (refinedAmount <= 0n) {
    throw new BuildKeysignPayloadError('not-enough-funds')
  }

  return {
    ...input.keysignPayload,
    toAmount: refinedAmount.toString(),
  }
}
