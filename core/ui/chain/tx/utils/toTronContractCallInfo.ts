import { attempt } from '@vultisig/lib-utils/attempt'

import { parseSignature } from './extractTokenAndAmount'
import { toTronAddress } from './toTronAddress'

type DecodedContractCall = {
  functionSignature: string
  functionArguments: string
}

const evmAddressPattern = /^0x[0-9a-fA-F]{40}$/

const parseJson = (value: string): unknown => JSON.parse(value)

/**
 * Rewrites a decoded TRON contract call's top-level `address` arguments from
 * the `0x…` form ABI decoding returns to the `T…` form the dApp shows.
 * Nested tuples and arrays are left as decoded.
 */
export const toTronContractCallInfo = <T extends DecodedContractCall>(
  info: T
): T => {
  const args = attempt(() => parseJson(info.functionArguments))
  if ('error' in args || !Array.isArray(args.data)) {
    return info
  }

  const { paramTypes } = parseSignature(info.functionSignature)
  const functionArguments = args.data.map((arg, index) =>
    paramTypes[index] === 'address' &&
    typeof arg === 'string' &&
    evmAddressPattern.test(arg)
      ? toTronAddress(arg)
      : arg
  )

  return {
    ...info,
    functionArguments: JSON.stringify(functionArguments, null, 2),
  }
}
