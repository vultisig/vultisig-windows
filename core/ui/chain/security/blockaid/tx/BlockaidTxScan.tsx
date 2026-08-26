import { BlockaidTxScanStatus } from '@core/ui/chain/security/blockaid/tx/BlockaidTxScanStatus'
import { useBlockaidTxScanQuery } from '@core/ui/chain/security/blockaid/tx/queries/useBlockaidTxScanQuery'
import { useIsBlockaidEnabled } from '@core/ui/storage/blockaid'
import { Query } from '@lib/ui/query/Query'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

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
  const txScanQuery = useBlockaidTxScanQuery(keysignPayloadQuery)

  if (!isBlockaidEnabled) {
    return null
  }

  return <BlockaidTxScanStatus value={txScanQuery} />
}
