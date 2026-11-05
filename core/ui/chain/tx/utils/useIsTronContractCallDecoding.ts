import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { getTronContractCall } from './getTronContractCall'
import { useEvmContractCallInfoQuery } from './useEvmContractCallInfoQuery'

/**
 * True while the call a Tron dApp contract payload signs is still being decoded
 * for the review screen. A failed decode settles it too, as that screen then
 * falls back to the raw calldata.
 */
export const useIsTronContractCallDecoding = (
  keysignPayload: KeysignPayload | undefined
) => {
  const call = keysignPayload && getTronContractCall(keysignPayload)
  const query = useEvmContractCallInfoQuery({ memo: call?.data })

  return !!call && query.isPending
}
