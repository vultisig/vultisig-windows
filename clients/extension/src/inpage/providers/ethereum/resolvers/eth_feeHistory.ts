import { callBackground } from '@core/inpage-provider/background'
import { BlockTag } from 'viem'

type FeeHistoryResult = {
  baseFeePerGas: `0x${string}`[]
  gasUsedRatio: number[]
  oldestBlock: `0x${string}`
  reward?: `0x${string}`[][]
}

export const getEthFeeHistory = async ([
  blockCount,
  newestBlock,
  rewardPercentiles,
]: [
  `0x${string}` | number,
  BlockTag | `0x${string}`,
  number[] | undefined,
]): Promise<FeeHistoryResult> =>
  callBackground({
    evmClientRequest: {
      method: 'eth_feeHistory',
      params: [blockCount, newestBlock, rewardPercentiles ?? []],
    },
  }) as Promise<FeeHistoryResult>
