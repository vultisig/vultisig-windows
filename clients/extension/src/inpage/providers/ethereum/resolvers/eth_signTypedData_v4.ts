import { EIP1193Error } from '@clients/extension/src/background/handlers/errorHandler'
import { callPopup } from '@core/inpage-provider/popup'
import { getEip712PayloadIssue } from '@core/inpage-provider/popup/eip712'
import {
  Eip712V4Payload,
  isEip712V4Payload,
} from '@core/inpage-provider/popup/interface'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'

import { getChain, processSignature } from '../utils'

const evmAddressPattern = /^0x[0-9a-fA-F]{40}$/

const isEvmAddress = (value: unknown): value is string =>
  typeof value === 'string' && evmAddressPattern.test(value)

/**
 * Serves `eth_signTypedData_v4` and its `eth_signTypedData` /
 * `eth_signTypedData_v3` aliases — v3-compatible payloads hash identically
 * under EIP-712, so one pipeline covers all three. Params arrive as
 * `[account, payload]` or `[payload, account]` depending on the dApp
 * (MetaMask accepts both), so the account is detected by shape — a JSON
 * payload can never look like an address. The payload is hash-checked up
 * front so a malformed message (e.g. an empty string in a bytes field)
 * rejects with a descriptive `InvalidParams` error at request time instead
 * of failing mid-keysign after the user has approved.
 */
export const signEthTypedDataV4 = async ([first, second]: [
  string | Eip712V4Payload,
  string | Eip712V4Payload,
]): Promise<string> => {
  const [account, input] = isEvmAddress(first)
    ? [first, second]
    : [second, first]

  if (!isEvmAddress(account)) {
    throw new EIP1193Error(
      'InvalidParams',
      'eth_signTypedData params must include the signer address'
    )
  }

  const parsed =
    typeof input === 'string'
      ? withFallback(
          attempt((): unknown => JSON.parse(input)),
          undefined
        )
      : input

  if (Array.isArray(parsed)) {
    throw new EIP1193Error(
      'InvalidParams',
      'eth_signTypedData V1 array payloads are not supported; pass an EIP-712 object with domain, types, primaryType, and message'
    )
  }

  if (!isEip712V4Payload(parsed)) {
    throw new EIP1193Error(
      'InvalidParams',
      'Invalid eth_signTypedData_v4 payload'
    )
  }

  const issue = getEip712PayloadIssue(parsed)
  if (issue) {
    throw new EIP1193Error(
      'InvalidParams',
      `Cannot sign EIP-712 payload: ${issue}`
    )
  }

  const chain = await getChain()

  const result = await callPopup(
    {
      signMessage: {
        eth_signTypedData_v4: {
          chain,
          message: parsed,
        },
      },
    },
    {
      account,
    }
  )

  return processSignature(result)
}
