import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { AccountCoin } from '@vultisig/core-chain/coin/AccountCoin'
import { buildLimitSwapKeysignPayload } from '@vultisig/core-mpc/keysign/swap/buildLimitSwapKeysignPayload'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'

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

  return useQuery({
    queryKey: [
      'limitSwapKeysignPayload',
      {
        fromCoin,
        toCoin,
        amount: amount.toString(),
        memo,
        expectedToAmount: expectedToAmount.toString(),
        vaultId: getVaultId(vault),
      },
    ],
    queryFn: () =>
      buildLimitSwapKeysignPayload(
        getLimitSwapKeysignPayloadInput({
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
      ),
    ...noRefetchQueryOptions,
  })
}
