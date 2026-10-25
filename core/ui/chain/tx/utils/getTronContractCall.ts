import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { ensureHexPrefix } from '@vultisig/lib-utils/hex/ensureHexPrefix'

/**
 * The call a Tron dApp `TriggerSmartContract` payload signs: its calldata,
 * 0x-prefixed so it decodes like EVM calldata, and the contract it targets.
 * The contract's data, not the memo, is what gets signed, so review decodes it.
 */
export const getTronContractCall = ({ contractPayload }: KeysignPayload) => {
  if (contractPayload.case !== 'tronTriggerSmartContractPayload') {
    return undefined
  }

  const { data, contractAddress } = contractPayload.value
  if (!data) {
    return undefined
  }

  return { data: ensureHexPrefix(data), contractAddress }
}
