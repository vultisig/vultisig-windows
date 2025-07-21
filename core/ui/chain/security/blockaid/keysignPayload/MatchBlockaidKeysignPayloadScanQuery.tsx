import { BlockaidTxScanResult } from '@core/chain/security/blockaid/tx/scan'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import {
  MatchQuery,
  MatchQueryProps,
} from '@lib/ui/query/components/MatchQuery'

import { useBlockaidKeysignPayloadScanQuery } from './queries/blockaidKeysignPayloadScan'

export const MatchBlockaidKeysignPayloadScanQuery: React.FC<
  Omit<MatchQueryProps<BlockaidTxScanResult>, 'value'> & {
    value: KeysignPayload
  }
> = ({ value, ...props }) => {
  const query = useBlockaidKeysignPayloadScanQuery(value)

  return <MatchQuery value={query} {...props} />
}
