import { attempt } from '@lib/utils/attempt'
import { Interface } from 'ethers'

import { getEvmContractCallHexSignature } from './hexSignature'
import { getEvmContractCallSignatures } from './signatures'

type EvmContractCallInfo = {
  functionSignature: string
  functionArguments: string
}

export const getEvmContractCallInfo = async (
  value: string
): Promise<EvmContractCallInfo | null> => {
  const hexSignature = getEvmContractCallHexSignature(value)

  const { data } = await attempt(getEvmContractCallSignatures(hexSignature))

  if (!data) {
    return null
  }

  const { results } = data

  const [result] = results
  if (!result) {
    return null
  }

  const { text_signature } = result
  if (!text_signature) {
    return null
  }

  const abi = new Interface([`function ${text_signature}`])
  const [fragment] = text_signature.split('(')

  const decodedData = abi.decodeFunctionData(fragment, value)

  return {
    functionArguments: JSON.stringify(
      decodedData,
      (_, value) => {
        if (typeof value === 'bigint') {
          return value.toString()
        }
        if (value && typeof value === 'object') {
          const maybe = value as {
            _isBigNumber?: boolean
            toString?: () => string
          }
          if (maybe._isBigNumber && typeof maybe.toString === 'function') {
            return maybe.toString()
          }
        }
        return value
      },
      2
    ),
    functionSignature: text_signature,
  }
}
