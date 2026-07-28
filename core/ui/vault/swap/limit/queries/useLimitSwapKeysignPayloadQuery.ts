import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { buildLimitSwapKeysignPayload } from '@vultisig/core-mpc/keysign/swap/buildLimitSwapKeysignPayload'
import { omit } from '@vultisig/lib-utils/record/omit'

import { getLimitSwapKeysignPayloadInput } from '../keysignPayloadInput'

type UseLimitSwapKeysignPayloadQueryInput = {
  fromCoin: AccountCoin
  toCoin: AccountCoin
  /** Source amount in the coin's native smallest units. */
  amount: bigint
  /** The `=<` memo from `buildLimitSwapMemoForCoins`. */
  memo: string
  /** The order's LIM in the target's smallest units, for co-signer display only. */
  expectedToAmount: bigint
}

/**
 * Build the keysign payload for a placed limit order.
 *
 * The SDK's `buildLimitSwapKeysignPayload` owns the branching (RUNE `MsgDeposit`
 * / native transfer / ERC20 router deposit) and the sign-time fail-closed gates
 * (the `EnableAdvSwapQueue` mimir and halts), so this only supplies the vault
 * identity, keys, and `walletCore` — exactly as `useSwapKeysignPayloadQuery`
 * does for a market swap. Its rejections (disabled queue, halted chain) surface
 * through the query error, which the verify screen renders.
 */
export const useLimitSwapKeysignPayloadQuery = ({
  fromCoin,
  toCoin,
  amount,
  memo,
  expectedToAmount,
}: UseLimitSwapKeysignPayloadQueryInput) => {
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const fromPublicKey = useCurrentVaultPublicKey(fromCoin.chain)
  const toPublicKey = useCurrentVaultPublicKey(toCoin.chain)

  const input = getLimitSwapKeysignPayloadInput({
    fromCoin,
    toCoin,
    amount,
    memo,
    expectedToAmount,
    vault,
    fromPublicKey,
    toPublicKey,
    walletCore,
  })

  return useQuery({
    // Keyed off the whole signing identity, not just the vault id: a reshare
    // keeps the ECDSA key (and so the id) while changing `localPartyId` and
    // `libType`, and refetch-on-mount is off — so a vault-id-only key could
    // serve a payload built for the previous participant set. Mirrors the
    // market-swap query, omitting the same unserializable WalletCore handles.
    queryKey: [
      'limitSwapKeysignPayload',
      {
        ...omit(
          input,
          'walletCore',
          'fromPublicKey',
          'toPublicKey',
          'amount',
          'expectedToAmount'
        ),
        amount: amount.toString(),
        expectedToAmount: expectedToAmount.toString(),
      },
    ],
    queryFn: () => buildLimitSwapKeysignPayload(input),
    ...noRefetchQueryOptions,
  })
}
