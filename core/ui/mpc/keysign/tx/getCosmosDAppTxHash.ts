import { unknownTxHash } from '@core/ui/chain/tx/unknownTxHash'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'

import { getCosmosKeplrBridgeTxHash } from './getCosmosKeplrBridgeTxHash'

type GetCosmosDAppTxHashInput = Parameters<typeof getCosmosKeplrBridgeTxHash>[0]

/** Cosmos dApp keysign hash: `unknownTxHash` when the dApp broadcasts and the hash cannot be rebuilt. */
export const getCosmosDAppTxHash = (
  input: GetCosmosDAppTxHashInput
): string => {
  if (!input.keysignPayload.skipBroadcast) {
    return getCosmosKeplrBridgeTxHash(input)
  }

  return withFallback(
    attempt(() => getCosmosKeplrBridgeTxHash(input)),
    unknownTxHash
  )
}
