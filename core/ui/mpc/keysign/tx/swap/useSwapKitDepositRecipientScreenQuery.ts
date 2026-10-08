import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { screenSwapKitDepositRecipient } from '@vultisig/core-chain/swap/general/knownAggregatorRouters'
import { getKeysignSwapKitDepositRecipient } from '@vultisig/core-mpc/keysign/swap/getKeysignSwapKitDepositRecipient'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'

/**
 * Blockaid's screen of the address a SwapKit ERC-20 deposit pays, the same one
 * every signer runs before signing. Inactive for any other payload (a deposit
 * the signer refuses outright is refused before it gets here); fails only on a
 * Malicious verdict, which the signer refuses too.
 */
export const useSwapKitDepositRecipientScreenQuery = (
  keysignPayload: KeysignPayload | undefined
) => {
  const address =
    keysignPayload &&
    withFallback(
      attempt(() => getKeysignSwapKitDepositRecipient(keysignPayload)),
      undefined
    )
  const input =
    keysignPayload && address
      ? { address, chain: getKeysignChain(keysignPayload) }
      : undefined

  return usePotentialQuery(input, ({ address, chain }) => ({
    queryKey: ['swapKitDepositRecipientScreen', address, chain],
    queryFn: () => screenSwapKitDepositRecipient(address, chain),
    ...noRefetchQueryOptions,
    networkMode: 'always',
    retry: false,
  }))
}
