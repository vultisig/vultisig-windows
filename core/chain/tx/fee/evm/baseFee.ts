import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

export const getEvmBaseFee = async (chain: EvmChain) => {
  const client = getEvmClient(chain)
  const { baseFeePerGas } = await client.getBlock()

  return shouldBePresent(baseFeePerGas)
}
