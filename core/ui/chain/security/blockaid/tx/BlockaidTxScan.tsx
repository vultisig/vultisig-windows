import { BlockaidTxScanInput } from '@core/chain/security/blockaid/tx/scan'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'

import { BlockaidNoTxScanStatus } from './BlockaidNoTxScanStatus'
import { BlockaidTxScanning } from './BlockaidTxScanning'
import { BlockaidTxScanResult } from './BlockaidTxScanResult'
import { useBlockaidTxScanQuery } from './queries/blockaidTxScan'

export const BlockaidTxScan = ({ value }: ValueProp<BlockaidTxScanInput>) => {
  const query = useBlockaidTxScanQuery(value)

  return (
    <MatchQuery
      value={query}
      error={() => <BlockaidNoTxScanStatus />}
      pending={() => <BlockaidTxScanning />}
      success={value => <BlockaidTxScanResult value={value} />}
    />
  )
}
