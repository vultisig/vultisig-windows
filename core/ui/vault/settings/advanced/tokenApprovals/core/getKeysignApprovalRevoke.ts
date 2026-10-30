import { EvmChain } from '@vultisig/core-chain/Chain'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { decodeFunctionData, erc20Abi, isHex } from 'viem'

/** The allowance a revoke payload clears. */
export type KeysignApprovalRevoke = {
  chain: EvmChain
  owner: string
  token: string
  spender: string
}

/**
 * Recognises a payload built by the Revoke flow, an `approve(spender, 0)`
 * call to the token contract, and returns the allowance it clears.
 */
export const getKeysignApprovalRevoke = ({
  coin,
  memo,
  toAddress,
}: KeysignPayload): KeysignApprovalRevoke | null => {
  if (
    !coin ||
    !memo ||
    !isHex(memo) ||
    !isOneOf(coin.chain, Object.values(EvmChain))
  ) {
    return null
  }

  try {
    const { functionName, args } = decodeFunctionData({
      abi: erc20Abi,
      data: memo,
    })
    if (functionName !== 'approve' || args[1] !== 0n) {
      return null
    }

    return {
      chain: coin.chain,
      owner: coin.address,
      token: toAddress,
      spender: args[0],
    }
  } catch {
    return null
  }
}
