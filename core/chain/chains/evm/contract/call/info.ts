import { attempt } from '@lib/utils/attempt'
import { Interface } from 'ethers'

import { getEvmContractCallHexSignature } from './hexSignature'
import { getEvmContractCallSignatures } from './signatures'

type EvmContractCallInfo = {
  functionSignature: string
  functionArguments: string
}

const processDecodedData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => processDecodedData(item))
  } else if (typeof data === 'bigint') {
    return data.toString()
  } else if (typeof data === 'object' && data !== null) {
    if (data.toString && (data._isBigNumber || typeof data === 'bigint')) {
      return data.toString()
    }
    return Object.keys(data).reduce((acc, key) => {
      acc[key] = processDecodedData(data[key])
      return acc
    }, {} as any)
  }
  return data
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
  const processedData = processDecodedData(decodedData)

  return {
    functionArguments: JSON.stringify(processedData, null, 2),
    functionSignature: text_signature,
  }
}
