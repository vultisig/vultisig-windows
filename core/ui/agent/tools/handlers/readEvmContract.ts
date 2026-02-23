import { EvmChain } from '@core/chain/Chain'
import { getChainKind } from '@core/chain/ChainKind'
import { getEvmClient } from '@core/chain/chains/evm/client'
import {
  type Abi,
  type AbiFunction,
  type AbiParameter,
  decodeFunctionResult,
  encodeFunctionData,
  type Hex,
} from 'viem'

import { getChainFromString } from '../../utils/getChainFromString'
import type { ToolHandler } from '../types'

type AbiParam = {
  type: string
  value: string
}

const toAbiType = (t: string): string => {
  const lower = t.toLowerCase()
  if (lower === 'address') return 'address'
  if (lower === 'uint256') return 'uint256'
  if (lower === 'string') return 'string'
  if (lower === 'bytes') return 'bytes'
  if (lower === 'bool') return 'bool'
  return t
}

const buildAbi = (
  functionName: string,
  inputParams: AbiParam[],
  outputTypes: string[]
): [Abi, string] => {
  let fnName = functionName
  const inputs: AbiParameter[] = []

  if (functionName.includes('(')) {
    fnName = functionName.slice(0, functionName.indexOf('('))
    const sig = functionName.slice(
      functionName.indexOf('(') + 1,
      functionName.lastIndexOf(')')
    )
    if (sig.trim()) {
      const types = sig.split(',').map(s => s.trim())
      for (let i = 0; i < types.length; i++) {
        inputs.push({
          name: `arg${i}`,
          type: toAbiType(types[i]),
        } as AbiParameter)
      }
    }
  } else {
    for (let i = 0; i < inputParams.length; i++) {
      inputs.push({
        name: `arg${i}`,
        type: toAbiType(inputParams[i].type),
      } as AbiParameter)
    }
  }

  const outputs: AbiParameter[] = outputTypes.map(
    (t, i) =>
      ({
        name: `out${i}`,
        type: toAbiType(t),
      }) as AbiParameter
  )

  const abiItem: AbiFunction = {
    type: 'function',
    name: fnName,
    inputs,
    outputs,
    stateMutability: 'view',
  }

  return [[abiItem] as Abi, fnName]
}

const coerceArg = (param: AbiParam): unknown => {
  const t = param.type.toLowerCase()
  if (t === 'bool') return param.value === 'true'
  if (t.startsWith('uint') || t.startsWith('int')) {
    const str = String(param.value).trim()
    if (!str || !/^-?\d+$/.test(str)) {
      throw new Error(
        `Invalid integer value "${param.value}" for type ${param.type}`
      )
    }
    return BigInt(str)
  }
  return param.value
}

const formatOutput = (value: unknown): string => {
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'boolean') return value.toString()
  if (Array.isArray(value)) return value.map(formatOutput).join(', ')
  return String(value)
}

export const handleReadEvmContract: ToolHandler = async input => {
  const chainStr = String(input.chain ?? '').trim()
  const contractAddress = String(input.contract_address ?? '').trim()
  const functionName = String(input.function_name ?? '').trim()
  const rawParams = Array.isArray(input.params) ? input.params : []
  const params: AbiParam[] = rawParams.map((p: Record<string, unknown>) => ({
    type: String(p.type ?? ''),
    value: String(p.value ?? ''),
  }))
  const outputTypes = (input.output_types ?? ['uint256']) as string[]

  if (!chainStr || !contractAddress || !functionName) {
    throw new Error('chain, contract_address, and function_name are required')
  }

  const chain = getChainFromString(chainStr)
  if (!chain) {
    throw new Error(`Unknown chain: ${chainStr}`)
  }

  if (getChainKind(chain) !== 'evm') {
    throw new Error(`${chainStr} is not an EVM chain`)
  }

  const publicClient = getEvmClient(chain as EvmChain)

  const [abi, fnName] = buildAbi(functionName, params, outputTypes)
  const args = params.map(coerceArg)

  const calldata = encodeFunctionData({
    abi,
    functionName: fnName,
    args: args.length > 0 ? args : undefined,
  })

  const result = await publicClient.call({
    to: contractAddress as `0x${string}`,
    data: calldata as Hex,
  })

  if (!result.data) {
    return {
      data: {
        chain: chainStr,
        contract_address: contractAddress,
        function_name: functionName,
        raw_result: '0x',
        decoded: null,
        message: 'No data returned from contract call',
      },
    }
  }

  const decoded = decodeFunctionResult({
    abi,
    functionName: fnName,
    data: result.data,
  })

  const formatted = Array.isArray(decoded)
    ? (decoded as unknown[]).map(formatOutput)
    : [formatOutput(decoded)]

  return {
    data: {
      chain: chainStr,
      contract_address: contractAddress,
      function_name: functionName,
      raw_result: result.data,
      decoded: formatted,
      output_types: outputTypes,
    },
  }
}
