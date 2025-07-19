import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'

import { BlockaidNoTxScanStatus } from './noScanStatus'
import { useBlockaidTxScanQuery } from './query'
import { BlockaidTxScanResult } from './result'
import { BlockaidTxScanning } from './scanning'
type BlockaidTxScanProps = {
  keysignPayload: KeysignPayload
}

export const BlockaidTxScan = ({ keysignPayload }: BlockaidTxScanProps) => {
  const query = useBlockaidTxScanQuery(keysignPayload)

  return (
    <MatchQuery
      value={query}
      error={() => <BlockaidNoTxScanStatus />}
      pending={() => <BlockaidTxScanning />}
      success={riskLevel => <BlockaidTxScanResult riskLevel={riskLevel} />}
    />
  )
}
