import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'

export const getEvmMaxPriorityFeePerGas = async (chain: EvmChain) =>
  getEvmClient(chain).estimateMaxPriorityFeePerGas()
