import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { BlockaidTxScanStatus } from '@core/ui/chain/security/blockaid/tx/BlockaidTxScanStatus'
import { getBlockaidTxValidationQuery } from '@core/ui/chain/security/blockaid/tx/queries/blockaidTxValidation'
import { useIsBlockaidEnabled } from '@core/ui/storage/blockaid'
import { usePotentialQuery } from '@lib/ui/query/hooks/usePotentialQuery'
import { useTransformQueryDataAsync } from '@lib/ui/query/hooks/useTransformQueryData'
import { Query } from '@lib/ui/query/Query'
import { getBlockaidTxValidationInput } from '@vultisig/core-mpc/security/blockaid/tx/validation/input'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useCallback } from 'react'

type BlockaidTxScanProps = {
  keysignPayloadQuery: Query<KeysignPayload>
}

/**
 * Self-contained Blockaid transaction-scan banner. Runs the validation against
 * the resolved keysign payload and renders the scan status. Renders nothing
 * when Blockaid is disabled. Shared by the initiator's pre-sign screen and the
 * joiner's verify screen so both co-signers see the same security result.
 */
export const BlockaidTxScan = ({
  keysignPayloadQuery,
}: BlockaidTxScanProps) => {
  const isBlockaidEnabled = useIsBlockaidEnabled()
  const walletCore = useAssertWalletCore()

  const txScanInput = useTransformQueryDataAsync(
    keysignPayloadQuery,
    useCallback(
      async payload => {
        if (!isBlockaidEnabled) {
          return null
        }

        return getBlockaidTxValidationInput({ payload, walletCore })
      },
      [isBlockaidEnabled, walletCore]
    )
  )

  const txScanQuery = usePotentialQuery(
    txScanInput.data || undefined,
    getBlockaidTxValidationQuery
  )
  const mergedTxScanQuery = {
    ...txScanQuery,
    error: txScanInput.error ?? txScanQuery.error,
    isPending: txScanInput.isPending || txScanQuery.isPending,
  }

  if (!isBlockaidEnabled) {
    return null
  }

  return <BlockaidTxScanStatus value={mergedTxScanQuery} />
}
