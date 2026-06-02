import { BlockaidNoScanStatus } from '@core/ui/chain/security/blockaid/scan/BlockaidNoScanStatus'
import { BlockaidScanning } from '@core/ui/chain/security/blockaid/scan/BlockaidScanning'
import { BlockaidScanStatusContainer } from '@core/ui/chain/security/blockaid/scan/BlockaidScanStatusContainer'
import { BlockaidTxValidationResult } from '@core/ui/chain/security/blockaid/tx/BlockaidTxValidationResult'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { BlockaidValidationResult } from '@vultisig/core-chain/security/blockaid/tx/validation/core'

type BlockaidTxScanStatusProps = {
  value: Query<BlockaidValidationResult | undefined>
}

/**
 * Presentational Blockaid scan banner — maps a tx-validation query to its scan
 * status UI. Shared by every screen that surfaces the scan so the banner stays
 * identical across the initiator and joiner flows.
 */
export const BlockaidTxScanStatus = ({ value }: BlockaidTxScanStatusProps) => (
  <MatchQuery
    value={value}
    success={result => <BlockaidTxValidationResult value={result} />}
    pending={() => <BlockaidScanning />}
    error={() => <BlockaidNoScanStatus entity="tx" />}
    inactive={() => <BlockaidScanStatusContainer />}
  />
)
