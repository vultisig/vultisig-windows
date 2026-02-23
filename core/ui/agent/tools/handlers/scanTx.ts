import { EvmChain } from '@core/chain/Chain'
import { queryBlockaid } from '@core/chain/security/blockaid/core/query'
import {
  blockaidEvmChain,
  BlockaidSupportedEvmChain,
} from '@core/chain/security/blockaid/evmChains'
import type { BlockaidValidation } from '@core/chain/security/blockaid/tx/validation/api/core'
import { productRootDomain } from '@core/config'

import type { ToolHandler } from '../types'

type BlockaidScanResponse = {
  validation: BlockaidValidation
}

const evmChainValues = Object.values(EvmChain) as string[]

const resolveBlockaidChain = (chain: string): string | null => {
  const match = evmChainValues.find(
    c => c.toLowerCase() === chain.toLowerCase()
  ) as BlockaidSupportedEvmChain | undefined

  if (!match) return null

  return blockaidEvmChain[match] ?? null
}

export const handleScanTx: ToolHandler = async input => {
  const chain = String(input.chain ?? '')
  const from = String(input.from ?? '')
  const to = String(input.to ?? '')
  const value = String(input.value ?? '0x0')
  const data = String(input.data ?? '0x')

  if (!chain) throw new Error('chain is required')
  if (!from) throw new Error('from is required')
  if (!to) throw new Error('to is required')

  const blockaidChain = resolveBlockaidChain(chain)
  if (!blockaidChain) {
    return {
      data: {
        result_type: 'unsupported',
        message: `Chain '${chain}' is not supported by Blockaid security scanning. Supported EVM chains: ${Object.keys(blockaidEvmChain).join(', ')}`,
      },
    }
  }

  const { validation } = await queryBlockaid<BlockaidScanResponse>(
    '/evm/json-rpc/scan',
    {
      data: {
        method: 'eth_sendTransaction',
        params: [{ from, to, value, data }],
      },
      chain: blockaidChain,
      metadata: {
        domain: productRootDomain,
      },
    }
  )

  return {
    data: {
      result_type: validation.result_type,
      description: validation.description ?? null,
      features: validation.features?.map(f => f.description) ?? [],
      chain,
    },
  }
}
