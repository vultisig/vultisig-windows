import { Address, encodeFunctionData, erc20Abi, getAddress, Hex } from 'viem'

import { permit2Abi, permit2Address } from './permit2'
import { Erc20Approval, Permit2Approval } from './TokenApproval'

type EvmRevokeCall = {
  /** The contract the zero-value call goes to. */
  receiver: Address
  calldata: Hex
}

/**
 * The call that clears an EVM approval: `approve(spender, 0)` on the token
 * for an ERC-20 allowance, `lockdown([(token, spender)])` on Permit2 for a
 * Permit2 one.
 */
export const getEvmRevokeCall = (
  approval: Erc20Approval | Permit2Approval
): EvmRevokeCall => {
  const token = getAddress(approval.token.id)
  const spender = getAddress(approval.spender)

  if (approval.kind === 'erc20') {
    return {
      receiver: token,
      calldata: encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender, 0n],
      }),
    }
  }

  return {
    receiver: permit2Address,
    calldata: encodeFunctionData({
      abi: permit2Abi,
      functionName: 'lockdown',
      args: [[{ token, spender }]],
    }),
  }
}
