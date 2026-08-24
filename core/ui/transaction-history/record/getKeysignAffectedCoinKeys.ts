import {
  AccountCoinKey,
  accountCoinKeyToString,
  extractAccountCoinKey,
} from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { getKeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapPayload'
import { KeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/KeysignSwapPayload'
import { getKeysignCoin } from '@vultisig/core-mpc/keysign/utils/getKeysignCoin'
import { fromCommCoin } from '@vultisig/core-mpc/types/utils/commCoin'
import { Coin } from '@vultisig/core-mpc/types/vultisig/keysign/v1/coin_pb'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'
import { attempt } from '@vultisig/lib-utils/attempt'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

/**
 * Every balance a broadcast keysign can move: the coin being spent, the coin a
 * swap lands in, and the chain's fee coin.
 *
 * The fee coin is the one most often wrong without this — a token send or token
 * swap burns gas that is never re-read if only the spent coin is refreshed. A
 * returned key for a coin the vault does not hold is harmless: invalidating a
 * key nothing has cached is a no-op.
 */
export const getKeysignAffectedCoinKeys = (
  payload: KeysignPayload
): AccountCoinKey[] => {
  const sourceCoin = getKeysignCoin(payload)
  const { chain, address } = sourceCoin

  const keys: AccountCoinKey[] = [
    extractAccountCoinKey(sourceCoin),
    { ...chainFeeCoin[chain], address },
  ]

  // Legacy kyberswap payloads make `getKeysignSwapPayload` throw. This runs in a
  // keysign success handler, so an escaping error would report a signing failure
  // for a transaction that already broadcast.
  const swapPayload = attempt(() => getKeysignSwapPayload(payload))

  const destinationCoin =
    'data' in swapPayload && swapPayload.data
      ? matchRecordUnion<KeysignSwapPayload, Coin | undefined>(
          swapPayload.data,
          {
            native: ({ toCoin }) => toCoin,
            general: ({ toCoin }) => toCoin,
          }
        )
      : undefined

  if (destinationCoin) {
    keys.push(extractAccountCoinKey(fromCommCoin(destinationCoin)))
  }

  return withoutDuplicates(
    keys,
    (one, another) =>
      accountCoinKeyToString(one) === accountCoinKeyToString(another)
  )
}
