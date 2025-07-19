import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'

import { BlockaidNoTxScanStatus } from './noScanStatus'
import { BlockaidTxScanInput, useBlockaidTxScanQuery } from './query'
import { BlockaidTxScanResult } from './result'
import { BlockaidTxScanning } from './scanning'

export const BlockaidTxScan = ({ value }: ValueProp<BlockaidTxScanInput>) => {
  const query = useBlockaidTxScanQuery(value)

  return (
    <MatchQuery
      value={query}
      error={() => <BlockaidNoTxScanStatus />}
      pending={() => <BlockaidTxScanning />}
      success={riskLevel => <BlockaidTxScanResult riskLevel={riskLevel} />}
    />
  )
}
