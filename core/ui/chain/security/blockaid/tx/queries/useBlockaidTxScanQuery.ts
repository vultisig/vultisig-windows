import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useIsBlockaidEnabled } from '@core/ui/storage/blockaid'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { useTransformQueryDataAsync } from '@lib/ui/query/hooks/useTransformQueryData'
import { Query } from '@lib/ui/query/Query'
import { getBlockaidTxValidationInput } from '@vultisig/core-mpc/security/blockaid/tx/validation/input'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

import {
  BlockaidTxScanResult,
  getBlockaidTxValidationQuery,
} from './blockaidTxValidation'

type BlockaidTxScanQuery = Query<BlockaidTxScanResult | undefined> & {
  /**
   * The scan itself is in flight. Narrower than `isPending`, which also covers
   * the keysign payload still being built — that wait belongs to the payload
   * query, and reporting it as a scan tells the user the wrong thing.
   */
  isScanning: boolean
}

/**
 * Blockaid transaction scan for a keysign payload, as a single query.
 *
 * Shared by the scan banner and by the screens that gate signing on it, so the
 * initiator and the joiner can never disagree about a transaction's verdict.
 * With Blockaid disabled — or on a chain it does not cover — the query settles
 * inactive rather than pending, and nothing is scanned.
 */
export const useBlockaidTxScanQuery = (
  keysignPayloadQuery: Query<KeysignPayload>
): BlockaidTxScanQuery => {
  const isBlockaidEnabled = useIsBlockaidEnabled()
  const walletCore = useAssertWalletCore()

  const txScanInput = useTransformQueryDataAsync(
    keysignPayloadQuery,
    async payload => {
      if (!isBlockaidEnabled) {
        return null
      }

      return getBlockaidTxValidationInput({ payload, walletCore })
    },
    ['blockaidTxValidationInput', isBlockaidEnabled]
  )

  const txScanQuery = usePotentialQuery(
    txScanInput.data || undefined,
    getBlockaidTxValidationQuery
  )

  const isPending = txScanInput.isPending || txScanQuery.isPending

  return {
    ...txScanQuery,
    error: txScanInput.error ?? txScanQuery.error,
    isPending,
    isScanning:
      isBlockaidEnabled && !keysignPayloadQuery.isPending && isPending,
  }
}
